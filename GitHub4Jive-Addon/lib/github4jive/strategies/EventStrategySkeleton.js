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

var INVALID_PREDICATE = "Invalid equality predicate. Must be a function that takes two objects and return whether they are equivalent.";
var INVALID_OPTIONS_PROVIDER = "Invalid options provider function";
var NULL_OBJECT = "Cannot add or update a null object";
var INVALID_BUILDER = "Invalid strategy builder";

function testForInvalidFunction(f) {
    return !f || typeof f !== "function";
}

/**
 * The EventStrategySkeleton class completes the GitHubFacade Event Handling encapsulation. It provides a
 * template for adding/updating and removing objects that are linked to GitHubEvents. Different kinds of objects
 * (places and tiles) need to register for events and some of those types of objects(tiles) even have different
 * strategies.
 *
 * **To handle this an instance of the skeleton should be created for each different strategySet builder
 * implementation. ***
 *
 * The skeleton requires 3 functions
 *      an instancePredicate function that is basically an equality test that determines whether
 *      two objects represent the same entity(place, tile)
 *
 *      and setup/teardown OptionProviders These simply take the instance of the entity and return the options
 *      to pass to the setup and teardown functions. There is no way to determin which options are for which strategy.
 *      So you need to include all options for all strategies for respective setup/teardown functions.
 *
 */
function StrategySkeleton(instancePredicate, setupOptionsProvider, teardownOptionsProvider) {
    if (testForInvalidFunction(instancePredicate)) {
        throw Error(INVALID_PREDICATE);
    }
    if (testForInvalidFunction(setupOptionsProvider) || testForInvalidFunction(teardownOptionsProvider)) {
        throw Error(INVALID_OPTIONS_PROVIDER);
    }
    this.tracking = [];
    this.instancePredicate = instancePredicate;
    this.setupOptions = setupOptionsProvider;
    this.teardownOptions = teardownOptionsProvider;
}

StrategySkeleton.INVALID_PREDICATE = INVALID_PREDICATE;
StrategySkeleton.INVALID_OPTIONS_PROVIDER = INVALID_OPTIONS_PROVIDER;
StrategySkeleton.NULL_OBJECT = NULL_OBJECT;
StrategySkeleton.INVALID_BUILDER = INVALID_BUILDER;

function wrapOptionsInPromise(options) {
    options = options || {};
    if (options.then) {
        return options;
    } else {
        return q(function () {
            return options;
        });
    }
}

function setupInstance(instance, options) {
    return wrapOptionsInPromise(options).then(function (op) {
        var promise = instance.strategies.setup(op);
        return promise;
    });
}

function teardownInstance(instance, options) {
    return wrapOptionsInPromise(options).then(function (op) {
        return instance.strategies.teardown(op);
    });
}
function decorateInstanceWithStrategies(instance, strategyBuilder) {
    var strategies = strategyBuilder.build();
    return instance.strategies = strategies;
}

/**
 * Add an object to the set of registered event handlers or update an existing object.
 * Corresponding setup and teardown sub routines are called for the object.
 * @param {object} obj the instance to attach the strategies too.
 * @param {object} strategySetBuilder the set builder state is not modified. The build
 * function is called to create the strategy set and that is attached to the instance.
 * @return {promise} promise containing the result of the setup Function
 *
 */
StrategySkeleton.prototype.addOrUpdate = function (obj, strategySetBuilder) {
    //Look for object to update
    var self = this;
  
    if (!obj || typeof obj !== "object") {
        throw Error(NULL_OBJECT);
    }

    strategySetBuilder = strategySetBuilder || self._defaultStrategySetBuilder;
    if (!strategySetBuilder || typeof strategySetBuilder.build !== "function") {
        throw Error(INVALID_BUILDER);
    }

    var tempCollection = [];
    var toTeardown;

    self.tracking.forEach(function (trackedObject) {
        if (self.instancePredicate(trackedObject, obj)) {
            toTeardown = trackedObject;
        } else {
            tempCollection.push(trackedObject);
        }
    });
    tempCollection.push(obj);
    self.tracking = tempCollection;

    //Update existing object or just setup a new one
    try {
      if (toTeardown) {
          return teardownInstance(toTeardown, self.teardownOptions(toTeardown)).then(function () {
              decorateInstanceWithStrategies(obj, strategySetBuilder);
              return setupInstance(obj, self.setupOptions(obj));
          });
      }
      else {
          decorateInstanceWithStrategies(obj, strategySetBuilder);
          var options = self.setupOptions(obj);
          return setupInstance(obj, options);
      }
    } catch ( e ) {
      console.trace(e);
      process.exit(-1);
    }
};

/**
 * Remove an object from the set of registerred event handlers and call its teardown sub routines
 * @param {object} toDelete the object to remove
 * @return {promise} result of the teardown promise or nothing if the object is not in the set.
 */
StrategySkeleton.prototype.remove = function (toDelete) {
    var self = this;
    var instanceToDelete = null;
    self.tracking.forEach(function (trackedObject) {
        if (self.instancePredicate(trackedObject, toDelete)) {
            instanceToDelete = trackedObject;
            return false;//break foreach
        }
    });
    return instanceToDelete ? teardownInstance(instanceToDelete, self.teardownOptions(instanceToDelete)) : q();
};

StrategySkeleton.prototype.setDefaultStrategySetBuilder = function(builder) {
    this._defaultStrategySetBuilder = builder;
};

module.exports = StrategySkeleton;
