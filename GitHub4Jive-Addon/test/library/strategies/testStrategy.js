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
var strategyBase = require("../../../common/strategies/EventStrategyBase");
var testStrategy = Object.create(strategyBase);

testStrategy.name = "TEST";

testStrategy.setup = function(setupOptions){
    setupOptions.setupRun = new Date().getTime();
    return q(function () {
        return "SOME_TOKEN";
    }).call();
};

testStrategy.teardown = function(teardownOptions){
    teardownOptions.should.have.property("eventToken").and.equal("SOME_TOKEN");
    teardownOptions.teardownRun = new Date().getTime();
    return q(function () {
        return ;
    }).call();
};
module.exports = testStrategy;
