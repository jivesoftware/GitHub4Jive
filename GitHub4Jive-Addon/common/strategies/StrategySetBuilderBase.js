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
var Q = require("q");

var TokenPool = require("./EventTokenPool");



function StrategySetBuilder() {
    this.strategies = [];
}

function tokenKey(strategy,options){
    return options.placeUrl + "_" + strategy.name;
}

function setupStrategies(strategies,index, options, tokenPool){
    if(index < strategies.length) {
        var strategy = strategies[index];
        return strategy.setup(options)
            .then(function (token) {
                tokenPool.addToken(tokenKey(strategy, options), token);
                return setupStrategies(strategies,++index, options, tokenPool);
            })
            .catch(function (error) {
                jive.logger.error(error);
            });
    }
    return Q.delay(0);
}

function teardownStrategies(strategies,index, options, tokenPool){

    if(index < strategies.length) {
        var strategy = strategies[index];
        options.eventToken = tokenPool.getByKey(tokenKey(strategy, options));
        return strategy.teardown(options)
            .then(function () {
                    tokenPool.removeTokenBykey(tokenKey(strategy,options));
                    return teardownStrategies(strategies,++index, options, tokenPool);
            })
            .catch(function (error) {
                jive.logger.error(error);
            });
    }
    return Q.delay(0);
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
    var tokenPool = new TokenPool();
    return {setup: function(options){
                return setupStrategies(strategies,0, options, tokenPool);
            },
            teardown: function (options) {
                return teardownStrategies(strategies,0, options, tokenPool);
            }
    }
};

StrategySetBuilder.prototype.reset = function () {
    this.strategies = [];
    return this;
};


module.exports = StrategySetBuilder;