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
var specificUser = "glen-nicol";
var repo = "GitHub4Jive";

var auth = {type:"basic", username:"", password: ""}

describe("GitHubFacade", function(){
    var git = require("../../common/GitHubFacade");
    it("should not be null", function(){
            should.exist(git);
    });

    describe("#isAuthenticated", function(){
        it("should return true with correct auth", function(){
            return git.isAuthenticated(auth).should.eventually.equal.true;
        });
    });

    describe("#getCurrentUser", function(){
        it("should return an object with login property", function(){
            var userPromise = git.getCurrentUser(auth);
            return userPromise.then(function(user){
                user.should.be.an("object");
                user.should.have.property("login");
                user.login.should.not.contain(" ");
                user.login.should.equal(specificUser);
            });
//            return Q.all([
//                userPromise.should.eventually.be.an("object"),
//                userPromise.should.eventually.have.property("login").should.equal(specificUser)
//            ]);
        });
    });

    describe("#getChangeList", function(){
        var changeListPromise = git.getChangeList(owner, repo, auth);
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

    describe("#getCompleteRepositoryListForUser", function(){
       var repositoriesPromise = git.getCompleteRepositoryListForUser(specificUser, auth);

        it("should contain an entry for all repositories the owner can push to.", function(){
            return Q.all([
            repositoriesPromise.should.eventually.be.an("array"),
            repositoriesPromise.should.eventually.have.length.above(0),
            repositoriesPromise.then(function(repos){
                repos.forEach(function(repo){
                    //checking for url correctness
                    repo.should.have.property("name").and.not.contain(" ");
                    repo.should.have.property("owner").and.not.contain(" ");
                    repo.should.have.property("fullName").and.not.contain(" ");
                })
            })
                ]);
        });
    });

    describe("#getRepositoryIssues", function(){
        var repoIssuesPromise = git.getRepositoryIssues(owner, repo, auth);

        it("should return an array of objects", function(){
            return Q.all([
                repoIssuesPromise.should.eventually.be.an("array"),
                repoIssuesPromise.should.eventually.have.length.above(0),
                repoIssuesPromise.then(function(issues){
                    issues[0].should.have.property("title");
                    issues[0].should.have.property("state");


                })
            ]);
        });
    });
})