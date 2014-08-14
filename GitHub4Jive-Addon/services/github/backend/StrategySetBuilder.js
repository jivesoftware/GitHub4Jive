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
var jive = require('jive-sdk');
var issues = require("./IssueStrategy");
var issueComments = require("./IssueCommentStrategy");
var Q = require("q");

function StrategySetBuilder() {
    this.strategies = [];
}

function strategySetSkeleton(strategies, index, options, action){
    if(index < strategies.length) {
        return strategies[index++][action](options)
            .catch(function (error) {
                jive.logger.error(error);
            }).done(function () {
                return strategySetSkeleton(strategies,index, options, action);
            });
    }
    return Q.delay(0);
}

function setupStrategies(strategies, options){
    return strategySetSkeleton(strategies, 0, options, "setup");
}

function teardownStrategies(strategies, options){
    return strategySetSkeleton(strategies, 0, options, "teardown");
}

/*
 * Build the strategy set and return the interface to setup and teardown that set for a given place.
 * The order of the calls leading up to build will determine the order of setup and teardown function.
 * This contains two functions. A setup and a teardown function.  Each accepts one argument which
 * should contain necessary information to set up the github webhook for the place.
 * @return {object} {setup: function(setupOptions){}, teardown: function(teardownOptions){}}
 */
StrategySetBuilder.prototype.build = function () {
    var strategies = [];
    this.strategies.forEach(function (strat) {
        strategies.push(strat);
    });
    return {setup: function(options){
            if(strategies.length) {
                return setupStrategies(strategies, options);
            }},
            teardown: function (options) {
                if(strategies.length) {
                    return teardownStrategies(strategies, options);
                }
            }


    }
};

StrategySetBuilder.prototype.issues = function(){
    this.strategies.push(issues);
    return this;
};

StrategySetBuilder.prototype.issueComments = function(){
    this.strategies.push(issueComments);
    return this;
};

module.exports = StrategySetBuilder;