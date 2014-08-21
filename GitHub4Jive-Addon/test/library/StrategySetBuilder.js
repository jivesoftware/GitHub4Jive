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

var chai = require('chai')
    , expect = chai.expect
    , should = chai.should();
var chaiAsPromised = require("chai-as-promised");
var q = require("q");

chai.use(chaiAsPromised);

var strategyBuilderBase = require("../../common/strategies/StrategySetBuilderBase");

var strategyBase = require("../../common/strategies/EventStrategyBase");
var testStrategy = Object.create(strategyBase);
var testStrategy2 = Object.create(strategyBase);
var failingSetupStrategy = Object.create(strategyBase);
var failingTeardownStrategy = Object.create(strategyBase);

testStrategy.name = "TEST";
testStrategy2.name = "TEST2";
failingSetupStrategy.name = "I_THROW_THINGS_ON_SETUP";
failingTeardownStrategy.name = "I_THROW_THINGS_ON_TEARDOWN";


testStrategy.setup = function(setupOptions){
    setupOptions.setupRun = new Date().getTime();
    return q(function () {
        return "SOME_TOKEN";
    }).call();
};

testStrategy2.setup = function(setupOptions){
    setupOptions.setup2Run = new Date().getTime();
    return q(function () {
        return "ANOTHER_TOKEN";
    }).call();
};

failingSetupStrategy.setup = function(setupOptions){
    setupOptions.failingSetupRun = new Date().getTime();
    return q(function () {
        throw Error("SETUP");
    }).call();
};

failingTeardownStrategy.setup = function(setupOptions){
    setupOptions.failingTeardownSetupRun = new Date().getTime();
    return q(function () {
       return "ANOTHER_TOKEN";
    }).call();
};

testStrategy.teardown = function(teardownOptions){
    teardownOptions.should.have.property("eventToken").and.equal("SOME_TOKEN");
    teardownOptions.teardownRun = new Date().getTime();
    return q(function () {
        return ;
    }).call();
};

testStrategy2.teardown = function(teardownOptions){
    teardownOptions.should.have.property("eventToken").and.equal("ANOTHER_TOKEN");
    teardownOptions.teardown2Run = new Date().getTime();
    return q(function () {
        return;
    }).call();
};

failingSetupStrategy.teardown = function(teardownOptions){
    //The setup failed therefore there is no token to unregister
    teardownOptions.should.have.property("eventToken").and.be.false;
    teardownOptions.failingSetupTeardownRun = new Date().getTime();
    return q(function () {
        return;
    }).call();
};

failingTeardownStrategy.teardown = function(teardownOptions){
    teardownOptions.failingTeardownRun = new Date().getTime();
    return q(function () {
        throw Error("TEARDOWN");
    }).call();
};

function builder(){
    strategyBuilderBase.apply(this);
}
builder.prototype = new strategyBuilderBase();


builder.prototype.test = function(){
    this.strategies.push(testStrategy);
    return this;
};

builder.prototype.test2 = function(){
    this.strategies.push(testStrategy2);
    return this;
};

builder.prototype.failSetup = function(){
    this.strategies.push(failingSetupStrategy);
    return this;
};

builder.prototype.failTeardown = function(){
    this.strategies.push(failingTeardownStrategy);
    return this;
};

describe("#StrategySetBuilderBase", function () {
    describe("#build", function () {
        it("should create an object with setup and teardown functions", function () {
            var b = new builder();
            var strats = b.test().build();
            strats.should.have.property("setup");
            strats.should.have.property("teardown");
        });
        it("should throw if no strategies have been added", function () {
            var b = new builder();
            expect(function () {
                b.build();
            }).to.throw(builder.EMPTY_SET);
        });

        it("calling setup should call all strategies setup functions in order", function () {
            var b = new builder();
            var strats = b.test().test2().build();
            var options = {};
            return strats.setup(options).then(function () {
                options.setupRun.should.not.be.above(options.setup2Run);
            });

        });

        it("calling teardown should call all strategies teardown functions in order", function () {
            var b = new builder();
            var strats = b.test().test2().build();
            var options = {placeUrl: "Some_Linked_Place"};
            return strats.setup(options).then(function () {
                return strats.teardown(options).then(function () {
                    options.teardownRun.should.not.be.above(options.teardown2Run);
                });
            });
        });

        it("should continue setting up if a strategy fails", function () {
            var b = new builder();
            var strats = b.test().failSetup().test2().build();
            var options = {placeUrl: "Some_Linked_Place"};
            return strats.setup(options).then(function () {
                options.should.have.property("setup2Run");
            });
        });

        it("should continue setting up if a strategy fails", function () {
            var b = new builder();
            var strats = b.test().failTeardown().test2().build();
            var options = {placeUrl: "Some_Linked_Place"};
            return strats.setup(options).then(function () {
                strats.teardown(options).then(function () {
                    options.should.have.property("teardown22Run");
                })

            });
        });
    });
});

