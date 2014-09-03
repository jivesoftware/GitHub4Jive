/*
 * Copyright 2014 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var q = require("q");

var INVALID_PREDICATE  = "Invalid equality predicate. Must be a function that takes two objects and return whether they are equivalent.";
var INVALID_OPTIONS_PROVIDER = "Invalid options provider function";
var NULL_OBJECT  = "Cannot add or update a null object";
var INVALID_BUILDER = "Invalid strategy builder";

function testForInvalidFunction(f){
    return !f || typeof f !== "function";
}

function StrategySkeleton(equalityPredicate, setupOptionsProvider, teardownOptionsProvider){


    if(testForInvalidFunction(equalityPredicate)){
        throw Error(INVALID_PREDICATE);
    }
    if(testForInvalidFunction(setupOptionsProvider) || testForInvalidFunction(teardownOptionsProvider)){
        throw Error(INVALID_OPTIONS_PROVIDER);
    }
    this.tracking = [];
    this.equalityPredicate = equalityPredicate;
    this.setupOptions = setupOptionsProvider;
    this.teardownOptions = teardownOptionsProvider;
};

StrategySkeleton.INVALID_PREDICATE = INVALID_PREDICATE;
StrategySkeleton.INVALID_OPTIONS_PROVIDER = INVALID_OPTIONS_PROVIDER;
StrategySkeleton.NULL_OBJECT = NULL_OBJECT;
StrategySkeleton.INVALID_BUILDER = INVALID_BUILDER;

function wrapOptionsInPromise(options){
    if(options.then){
        return options;
    }else {
        return q(function () {
            return options;
        });
    }
}

function setupInstance(instance, options){
    return wrapOptionsInPromise(options).then(function (op) {
        return instance.strategies.setup(op);
    });
}

function teardownInstance(instance, options) {
    return wrapOptionsInPromise(options).then(function (op) {
        return instance.strategies.teardown(op);
    });
}
function decorateInstanceWithStrategies(instance, strategyBuilder){
    return instance.strategies = strategyBuilder.build();
}

StrategySkeleton.prototype.addOrUpdate = function (obj, strategySetBuilder) {

    if(!obj || typeof obj !== "object"){
        throw Error(NULL_OBJECT);
    }
    if(!strategySetBuilder || typeof strategySetBuilder.build !== "function"){
        throw Error(INVALID_BUILDER);
    }
    var self = this;
    var tempCollection = [];
    var toTeardown;
    self.tracking.forEach(function (trackedObject) {
        if(self.equalityPredicate(trackedObject,obj )){
            toTeardown = trackedObject;
        }else{
            tempCollection.push(trackedObject);
        }
    });
    tempCollection.push(obj);
    self.tracking = tempCollection;
    if (toTeardown) {
        return teardownInstance(toTeardown, self.teardownOptions(toTeardown)).then(function () {
            return setupInstance(obj, self.setupOptions(obj));
        });
    }
    else {
        decorateInstanceWithStrategies(obj, strategySetBuilder);
        return setupInstance(obj, self.setupOptions(obj));
    }
};

StrategySkeleton.prototype.remove = function (toDelete) {
    var self = this;
    var instanceToDelete = null;
    self.tracking.forEach(function (trackedObject) {
        if(self.equalityPredicate(trackedObject,toDelete )){
            instanceToDelete = trackedObject;
            return false;
        }
    });
    return instanceToDelete ?  teardownInstance(instanceToDelete, self.teardownOptions(instanceToDelete)) : q(function () {
        return;
    });
};

module.exports = StrategySkeleton;