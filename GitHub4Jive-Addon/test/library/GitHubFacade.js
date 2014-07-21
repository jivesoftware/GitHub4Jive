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

/* We are using the Chai assertion library as well as as Chai as Promised to test asynchronous promises fluently.
 * Below are two simple BDD tests that describe the use of the GitHubFacade class that should be used to access
 * GitHub in a consistent way.
*/
var chai = require('chai')
    , should = chai.should();
var chaiAsPromised = require("chai-as-promised");
var Q = require("q");

chai.use(chaiAsPromised);

var owner = "jivesoftware";
var repo = "GitHub4Jive";

describe("GitHubFacade", function(){
    var git = require("../../common/GitHubFacade");
    it("should not be null", function(){
            should.exist(git);
    });

    describe("#getChangeList", function(){
        var changeListPromise = git.getChangeList(owner, repo);
        /*
        * Below is an example of the Chai as Promised fluent assertions. To test multiple assertions in a
        * single test you must wrap it in Q.all so that all the resulting promises are collected into one
        * to be returned to Mocha.
        * */
        it("should return an array of objects", function(){
            return Q.all([
                changeListPromise.should.eventually.be.an("array"),
                changeListPromise.should.eventually.have.length.above(0),
                changeListPromise.should.eventually.have.length.below(6),
                changeListPromise.should.eventually.have.property("0").be.an("object")
            ]);
        });
        /*
        * Below is an example of using a tradition then interface of promises to use normal Chai assertions on
        * the data that is retrieved from the promise.
        * */
        it("should have commitMessage and changes fields and changes should have fileName", function(){
            return changeListPromise.then(function(changeList){
                changeList[0].should.have.property("commitMessage");
                changeList[0].should.have.property("changes");
                changeList[0].changes.should.have.length.above(0);
                changeList[0].changes[0].should.have.property("fileName");
            });
        });
    });
})