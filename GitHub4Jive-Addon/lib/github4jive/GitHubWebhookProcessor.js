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
var EventStrategySkeleton = require(libDir + "github4jive/strategies/EventStrategySkeleton");
var WebhooksProcessorBuilder = require(libDir + "github4jive/strategies/StrategySetBuilderBase");

function GitHubWebhookProcessor(
    handlers,
    predicate,
    setupHandlerContextProvider,
    teardownHandlerContextProvider) {

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // setup webhook processor by creating a webhook handler object
  // and attaching event handlers to it

  // 1. create an object which will help construct a webhook processor
  // and attach the event handlers to it
  var configurator = new WebhooksProcessorBuilder();

  // 2. create the webhook processor object
  var processor = new EventStrategySkeleton(
      predicate,
      setupHandlerContextProvider, 
      teardownHandlerContextProvider
  );

  handlers.forEach( function(handler) {
      configurator.addStrategy(handler);
  });
  
  // 3. associate the handlers to the webhook processor
  processor.setDefaultStrategySetBuilder(configurator);
  
  this.processor = processor;
}

GitHubWebhookProcessor.prototype.setup = function(watchedObject) {
    var processor = this.processor;
    return processor.addOrUpdate.call( processor, watchedObject );
};

module.exports = GitHubWebhookProcessor;