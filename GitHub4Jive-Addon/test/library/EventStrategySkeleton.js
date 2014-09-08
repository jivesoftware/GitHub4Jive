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

chai.use(chaiAsPromised);

var StrategySkeleton = require("github4jive/strategies/EventStrategySkeleton");
var TestStrategyBuilder = require("./strategies/testStrategyBuilder");

describe("EventStrategySkeleton", function () {


    it("should throw with no predicate", function () {
        expect(function () {
            var strategyProvider = new StrategySkeleton();
        }).to.throw(StrategySkeleton.INVALID_PREDICATE);
    });

    it("should throw without both option providers", function () {
        expect(function () {
            var strategyProvider = new StrategySkeleton(function () {});
        }).to.throw(StrategySkeleton.INVALID_OPTIONS_PROVIDER);

        expect(function () {
            var strategyProvider = new StrategySkeleton(function () {}, function () {});
        }).to.throw(StrategySkeleton.INVALID_OPTIONS_PROVIDER);
        expect(function () {
            var strategyProvider = new StrategySkeleton(function () {}, null, function () {});
        }).to.throw(StrategySkeleton.INVALID_OPTIONS_PROVIDER);
    });

    describe("addOrUpdate", function () {
        it("should throw with no object", function () {
            expect(function () {
                var strategyProvider = new StrategySkeleton(function () {}, function(){}, function () {});
                strategyProvider.addOrUpdate(null);
            }).to.throw(StrategySkeleton.NULL_OBJECT);
        });

        it("should throw with no strategyBuilder", function () {
            expect(function () {
                var strategyProvider = new StrategySkeleton(function () {}, function(){}, function () {});
                strategyProvider.addOrUpdate({}, null);
            }).to.throw(StrategySkeleton.INVALID_BUILDER);
        });

        function uniqueTestObject(lhs, rhs){
            return lhs.name === rhs.name;
        }

        it("should add an element to its tracking array", function () {
            var strategyProvider = new StrategySkeleton(uniqueTestObject, function(){}, function () {});
            var builder = new TestStrategyBuilder();
            var obj = {name:"a"};
            strategyProvider.tracking.length.should.equal(0);
            strategyProvider.addOrUpdate(obj, builder.test());
            strategyProvider.tracking.length.should.equal(1);
            uniqueTestObject(strategyProvider.tracking[0], obj).should.be.true;
        });

        it("should update an element to its tracking array", function () {
            var strategyProvider = new StrategySkeleton(uniqueTestObject, function(){}, function () {});
            var builder = new TestStrategyBuilder();
            var obj = {name:"a"};
            strategyProvider.tracking.length.should.equal(0);
            strategyProvider.addOrUpdate(obj, builder.test());
            strategyProvider.tracking.length.should.equal(1);
            uniqueTestObject(strategyProvider.tracking[0], obj).should.be.true;
            var obj2 = {name:"a", extraProp: 1};
            uniqueTestObject(obj, obj2).should.be.true;
            strategyProvider.addOrUpdate(obj2, builder);
            strategyProvider.tracking.length.should.equal(1);
            uniqueTestObject(strategyProvider.tracking[0], obj).should.be.true;
            strategyProvider.tracking[0].should.have.property("extraProp");
        });
    });
});