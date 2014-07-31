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
var Q = require("q");

chai.use(chaiAsPromised);
var jive = require("jive-sdk");
var JiveFacadeLoader = require("../../common/JiveApiFacade");
var JiveBasicLoader = require("../../common/JiveBasicAuth");
var JiveOAuthLoader = require("../../common/JiveOauth");
var ContentBuilder = require("../../common/JiveContentBuilder")

var community = {jiveUrl: ""};
var tempOAuthToken = "";
var basic = new JiveBasicLoader("admin", "admin");

function createContent(jiveFacade, type) {
    return jiveFacade.create({type: type,
        content: {
            type: "text/html",
            text: "<h1>WooHOO</h1>"},
        subject: "YAHOO"
    });
}
describe("JiveApiFacade", function () {
    var jiveFacade = new JiveFacadeLoader(community, basic);

    it("should not be null", function () {
        should.exist(jiveFacade);
    });


    var createdID;
    describe("#create", function () {
        it("should return an object with an id and then be able to delete it", function () {
            return createContent(jiveFacade, "discussion").then(function (response) {
                response.should.have.property("success").and.be.true;
                response.should.have.property("apiID");
                createdID = response.apiID;
                return jiveFacade.delete(createdID).then(function (response) {
                    response.statusCode.should.equal(204);
                });
            }).catch(function (error) {
                throw error;
            });
        });
    });

    describe("#attachProps", function () {
        it("should return true when complete", function () {
            var oAuth = new JiveOAuthLoader(tempOAuthToken);
            var oAuthFacade = new JiveFacadeLoader(community,oAuth);

            return createContent(oAuthFacade, "discussion").then(function (response) {
                var contentID = response.apiID;
                return oAuthFacade.attachProps(contentID,{gitID: 1234}).then(function (response) {
                    response.should.have.property("success");
                    response.success.should.be.true;
                    return oAuthFacade.getByExtProp("gitID", 1234).then(function (response) {
                        return Q.all(response.list.map(function (content) {
                            content.should.have.property("retrieveAllExtProps").and.be.a("function");
                            return content.retrieveAllExtProps().then(function (props) {
                                Object.keys(props).length.should.be.above(0);
                            })
                        })).then(function () {
                            return oAuthFacade.delete(contentID).then(function (response) {
                                response.statusCode.should.equal(204);
                            });
                        });
                    })
                })
            });

        })
    });

    describe("#replyToDiscussion", function () {
        it("should return response when done", function () {
            return createContent(jiveFacade, "discussion").then(function (response) {
                var contentID = response.apiID;
                var builder = new ContentBuilder();
                var message = builder.message().body("DSAFDFDS").build();
                jiveFacade.replyToDiscussion(contentID, message).then(function (response) {
                    return jiveFacade.delete(contentID);
                })
            });
        });

    });

//    describe.only("#commentOn", function () {
//        function TestContentTypeComments(contentType) {
//            var builder = new ContentBuilder();
//            var comment = builder.comment().body("").build();
//            return createContent(jiveFacade, contentType).then(function (response) {
//                response.success.should.be.true;
//                var content = response.apiID;
//                return jiveFacade.commentOn(content, comment).then(function (response) {
//                    response.success.should.be.true;
//                }).done(function () {
//                    return jiveFacade.delete(content).then(function (res) {
//                        res.success.should.be.true;
//                    });
//                });
//            })
//        }
//
//        it("should add a comment to supported content", function () {
//            var contentType = "document";
//            return TestContentTypeComments(contentType);
//        });
//
//        it("should post a message to discussion which don't support comments", function () {
//            var contentType = "discussion";
//            //return TestContentTypeComments(contentType);
//        });
//    })
});
