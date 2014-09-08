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

var EventTokenPool = require("github4jive/strategies/EventTokenPool");

describe("EventTokenPool", function () {
    describe("#addToken", function () {
        it("should add key to pool", function () {
            var pool = new EventTokenPool();
            var key = "a";
            pool.addToken(key,"a");
            pool.tokens.should.contain.property(key);
        });

        it("should throw if key is duplicated", function () {
            var pool = new EventTokenPool();
            var key = "a";
            pool.addToken(key,"a");
            pool.tokens.should.contain.property(key);
            expect(function () {
                pool.addToken(key, "b")
            }).to.throw(EventTokenPool.DUPLICATE_KEY);
        });

        it("should throw if key is null or empty or contains whitespace", function () {
            var pool = new EventTokenPool();
            expect(function () {
                pool.addToken(null, "");
            }).to.throw(EventTokenPool.INVALID_KEY);
            expect(function () {
                pool.addToken("", "");
            }).to.throw(EventTokenPool.INVALID_KEY);
            expect(function () {
                pool.addToken("Valid_Except_for\t", "");
            }).to.throw(EventTokenPool.INVALID_KEY);
        });

        it("should throw if token is null or empty", function () {
            var pool = new EventTokenPool();
            var key = "a";
            expect(function () {
                pool.addToken(key,null);
            }).to.throw(EventTokenPool.INVALID_TOKEN);
            expect(function () {
                pool.addToken(key,"");
            }).to.throw(EventTokenPool.INVALID_TOKEN);

        })
    });
    describe("#getByKey", function () {
        it("should return the token for the key", function () {
            var pool = new EventTokenPool();
            var key = "a";
            pool.addToken(key,"a");
            pool.tokens.should.contain.property(key);
            pool.getByKey(key).should.equal("a");
        });

        it("should return false if key is not in pool", function () {
            var pool = new EventTokenPool();
            pool.getByKey("a").should.be.false;
        });
    });

    describe("#removeTokenByKey", function () {
        it("should return true when the key is removed", function () {
            var pool = new EventTokenPool();
            var key = "a";
            pool.addToken(key,"a");
            pool.getByKey(key).should.equal("a");
            pool.removeTokenByKey(key).should.equal.true;
        });

        it("should return true when the key was not there before", function () {
            var pool = new EventTokenPool();
            pool.removeTokenByKey("a").should.equal.true;
        });

        it("should return false when the key fails to Delete", function () {
            //TODO not sure how to test this. Only happens if delete fails.
        });
    });

    describe("#tokenKeys", function () {
        it("should return a list of all keys", function () {
            var pool = new EventTokenPool();
            var keys = ["a", "b"];
            pool.addToken(keys[0],keys[0]);
            pool.addToken(keys[1],keys[1]);
            pool.tokenKeys().should.include(keys[0]).and.include(keys[1]);
        });

        it("should return an empty list when no keys have been added", function () {
            var pool = new EventTokenPool();
            pool.tokenKeys().length.should.equal(0);
        });
    });

    describe("#allTokens", function () {
        it("should return a list of tokens", function () {
            var pool = new EventTokenPool();
            pool.allTokens().length.should.equal(0);
            var keys = ["a", "b"];
            pool.addToken(keys[0],keys[0]);
            pool.addToken(keys[1],keys[1]);
            pool.allTokens().should.include(keys[0]).and.include(keys[1]);

        });
    })
})