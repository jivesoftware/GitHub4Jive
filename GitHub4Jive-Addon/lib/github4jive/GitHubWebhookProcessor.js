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

var jive = require("jive-sdk");

var libDir = process.cwd() + "/lib/";
var JiveOauth = require(libDir + "github4jive/JiveOauth");
var placeStore = require(libDir + "github4jive/placeStore");
var base = require(libDir + "github4jive/strategies/EventStrategySkeleton");
var WebhooksProcessorBuilder = require(libDir + "github4jive/strategies/StrategySetBuilderBase");

////////////////////////////////////////////////////////////////////////////////////////////////////
// setup webhook processor by creating a webhook handler object
// and attaching event handlers to it

// 1. create an object which will help construct a webhook processor
// and attach the event handlers to it
var configurator = new WebhooksProcessorBuilder();

// 2. create the webhook processor object
var processor = new base(
    function(lhs, rhs) {
        return lhs.placeUrl === rhs.placeUrl;
    },
    getSetupHandlerProvider, getTeardownHandlerProvider
);

processor.addStrategy = function(strategy) {
    configurator.addStrategy(strategy);
    return this;
};

processor.setSetupHandlerContextProvider = function(contextProvider) {
    this.setupHandlerContextProvider = contextProvider;
    return this;
};

processor.setTeardownHandlerContextProvider = function(contextProvider) {
    this.teardownHandlerContextProvider = contextProvider;
    return this;
};

// 3. associate the handlers to the webhook processor
processor.setDefaultStrategySetBuilder(configurator);
module.exports = processor;


function getSetupHandlerProvider() {
    return this.setupHandlerContextProvider || function(){ return {}; };
}

function getTeardownHandlerProvider() {
    return this.teardownHandlerContextProvider || function(){ return {}; };
}
