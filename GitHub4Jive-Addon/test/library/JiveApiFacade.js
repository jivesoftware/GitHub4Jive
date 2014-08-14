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
var sinon = require('sinon');

chai.use(chaiAsPromised);
var jive = require("jive-sdk");
var JiveFacadeLoader = require("../../common/JiveApiFacade");
var JiveBasicLoader = require("../../common/JiveBasicAuth");
var JiveOAuthLoader = require("../../common/JiveOauth");
var ContentBuilder = require("../../common/JiveContentBuilder");

var community = {jiveUrl: "http://localhost:8080"};
var tempOAuthToken = jive.util.guid();
var tempOAuthRefreshToken = jive.util.guid();
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

    beforeEach(function() {
        jive = require("jive-sdk");
        jive.context.persistence =  new jive.persistence.memory();

        this.sandbox = sinon.sandbox.create();
        this.sandbox.inject(this);
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    var createdID;
    describe("#create", function () {
        it("should return an object with an id and then be able to delete it", function () {
            var contentID = 1000;
            this.stub(jive.util, "buildRequest", function( url, method, postBody, headers ) {
                // test basic auth
                if ( headers['Authorization'] !== basic.applyTo(null, null, {})['headers']['Authorization'] ) {
                    return Q.reject({ 'statusCode': 400 });
                }

                // if post, then return entity for contentID 1000 (expected by the test)
                if ( method === 'POST' ) {
                    return Q({
                        'statusCode' : 201,
                        'entity' : {
                            'resources' : {
                                'self' : {
                                    'ref' : community.jiveUrl + '/api/core/v3/contents/' + contentID
                                }
                            }
                        }
                    });
                } else {
                    return Q({
                        'statusCode' : url.indexOf('/contents/' + contentID) > -1 ? 204  : 500
                    });
                }
            });

            return createContent(jiveFacade, "discussion").then(function (response) {
                response.should.have.property("success").and.be.true;
                response.should.have.property("apiID");
                createdID = response.apiID;
                return jiveFacade.destroy(createdID).then(function (response) {
                    response.statusCode.should.equal(204);
                });
            }).catch(function (error) {
                throw error;
            });
        });
    });

    describe("#attachProps", function () {
        it("should return true when complete", function () {
            var oAuth = new JiveOAuthLoader(tempOAuthToken ,tempOAuthRefreshToken);
            var oAuthFacade = new JiveFacadeLoader(community,oAuth);

            this.stub(jive.community, "findByCommunity").returns(Q(community));

            // simulate what the Jive server is expected to return
            var contentID = 1000;
            this.stub(jive.util, "buildRequest", function( url, method, postBody, headers ) {
                // test basic auth
                if ( headers['Authorization'] !== 'Bearer ' + tempOAuthToken ) {
                    return Q.reject({ 'statusCode': 400 });
                }

                // if post, then return entity for contentID 1000 (expected by the test)
                if ( method === 'POST' ) {
                    return Q({
                        'statusCode' : 201,
                        'entity' : {
                            'resources' : {
                                'self' : {
                                    'ref' : community.jiveUrl + '/api/core/v3/contents/' + contentID
                                }
                            }
                        }
                    });
                } else if ( method === 'DELETE' ) {
                    return Q({
                        'statusCode' : url.indexOf('/contents/' + contentID) > -1 ? 204  : 500
                    });
                } else if ( method === 'GET' ) {
                    if ( url.indexOf(community.jiveUrl + '/api/core/v3/extprops/gitID/1234') == 0 ) {
                        return Q({
                            'statusCode' : 200,
                            'entity' : {
                                'list': [
                                    {
                                        'resources' : {
                                            'extprops' : {
                                                'allowed' : ['GET'],
                                                'ref' : community.jiveUrl + '/api/core/v3/contents/' + contentID
                                            }
                                        }
                                    }
                                ]
                            }
                        });
                    }
                    if ( url.indexOf(community.jiveUrl+ '/api/core/v3/contents/' + contentID ) == 0 ) {
                        return Q({
                            'statusCode' : 200,
                            'entity' : {
                                'resources' : {
                                    'self' : {
                                        'ref' : community.jiveUrl + '/api/core/v3/contents/' + contentID
                                    }
                                }
                            }
                        });
                    }
                }
            });

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
                            return oAuthFacade.destroy(contentID).then(function (response) {
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
            var contentID = 1000;
            this.stub(jive.util, "buildRequest", function( url, method, postBody, headers ) {
                // test basic auth
                if ( headers['Authorization'] !== basic.applyTo(null, null, {})['headers']['Authorization'] ) {
                    return Q.reject({ 'statusCode': 400 });
                }

                // if post, then return entity for contentID 1000 (expected by the test)
                if ( method === 'POST' ) {
                    return Q({
                        'statusCode' : 201,
                        'entity' : {
                            'resources' : {
                                'self' : {
                                    'ref' : community.jiveUrl + '/api/core/v3/contents/' + contentID
                                }
                            }
                        }
                    });
                } else {
                    return Q({
                        'statusCode' : url.indexOf('/contents/' + contentID) > -1 ? 204  : 500
                    });
                }
            });

            return createContent(jiveFacade, "discussion").then(function (response) {
                var contentID = response.apiID;
                var builder = new ContentBuilder();
                var message = builder.message().body("DSAFDFDS").build();
                return jiveFacade.replyToDiscussion(contentID, message).then(function (response) {
                    return jiveFacade.destroy(contentID);
                })
            });
        });

    });

    describe("#markFinal", function () {
        it("should return an outcome object", function () {

            return createContent(jiveFacade, "discussion").then(function (response) {
                var contentID = response.apiID;
                return jiveFacade.markFinal(contentID).then(function (response) {
                    response.success.should.be.true;
                    response.entity.should.be.an("object");
                    response.entity.id.should.be.above(0);

                    jiveFacade.getOutcomes(contentID).then(function (outcomes) {
                        outcomes.entity.list.length.should.be.above(0);
                        outcomes.entity.list[0].id.should.be.above(0);
                        return jiveFacade.destroy(contentID);
                    })


                })
            });
        })
    });

    describe("#unMarkFinal", function () {
        it("should return success and remove the final outcome", function () {
            return createContent(jiveFacade, "discussion").then(function (response) {
                var contentID = response.apiID;
                return jiveFacade.markFinal(contentID).then(function (response) {
                    response.success.should.be.true;
                    return jiveFacade.unMarkFinal(contentID).then(function (response) {
                        response.success.should.be.true;
                        return jiveFacade.destroy(contentID);
                    })

                })
            });
        })
    });

//    describe("#commentOn", function () {
//        function TestContentTypeComments(contentType) {
//            var builder = new ContentBuilder();
//            var comment = builder.comment().body("").build();
//            return createContent(jiveFacade, contentType).then(function (response) {
//                response.success.should.be.true;
//                var content = response.apiID;
//                return jiveFacade.commentOn(content, comment).then(function (response) {
//                    response.success.should.be.true;
//                }).done(function () {
//                    return jiveFacade.destroy(content).then(function (res) {
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

