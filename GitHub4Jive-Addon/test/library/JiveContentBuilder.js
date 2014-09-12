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

describe("JiveContentBuilder", function () {
    var ContentBuilder = require("github4jive/JiveContentBuilder")

    describe("constructor", function () {
        it("should accept no arguments", function () {
            var builder = new ContentBuilder();
        });

        it("should accept a valid Jive content object", function () {
            var builder = new ContentBuilder();
            var content = builder.discussion().subject("YO").body("a").build();
            builder = new ContentBuilder(content);
        });
    });

    describe("#build", function () {
        it("should return the object being built", function () {
            var builder = new ContentBuilder();
            var content = builder.discussion().subject("YO").body("a").build();
            content.should.have.property("type");
            content.should.have.property("content");
            content.content.should.have.property("type");
        });

        it("should throw when called without a type", function () {
            var builder = new ContentBuilder();
            expect(function(){builder.build();}).to.throw(builder.MISSING_TYPE);
        });

        it("should throw when called without calling body ", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.discussion().subject("YO").build();
            }).to.throw(builder.MISSING_BODY);
        });

        it("should throw without calling subject on a discussion ", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.discussion().body("a").build();
            }).to.throw(builder.MISSING_SUBJECT);
        });

        it("should not throw without calling subject on a message", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.message().body("a").build();
            }).to.not.throw(builder.MISSING_SUBJECT);
        });

        it("should accept callback to continue chaining", function () {
            var builder = new ContentBuilder();
            var firstContent = null;
            builder.discussion().subject("YO").body("a").build(function (finishedContent) {
                firstContent = finishedContent;
            }).body("chaining").build().should.not.deep.equal(firstContent);
        });
    });

    describe("#reset", function () {
        it("should reset builder to new state", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.discussion().subject("YO").body("a").reset().build();
            }).to.throw(builder.MISSING_TYPE);
        })
    });

    describe("#discussion", function () {
        it("should create an object with type discussion", function () {
            var builder = new ContentBuilder();
            builder.discussion().subject("YO").body("a").build().should.have.property("type").and.equal("discussion");
        });
    });

    describe("#subject", function () {
        it("should create a subject member",function(){
            var builder = new ContentBuilder();
            builder.discussion().body("a").subject("YO").build()
                .should.have.property("subject").and.equal("YO");
        });
    });

    describe("#body", function () {
        it("should should set the content text field", function () {
            var builder = new ContentBuilder();
            var b = ["a","b"];
            builder.discussion().subject("YO");
            b.forEach(function (body) {
                var content = builder.body(body).build();
                content.content.text.should.equal(body);
            })
        });

        it("should not throw when body is empty", function () {
            var builder = new ContentBuilder();

            var emptyBodies = [function () {

                builder.body("");
            },function () {

                builder.body(null);
            },function () {

                builder.body();
            }];

            emptyBodies.forEach(function (f) {
                expect(f).to.not.throw(builder.EMPTY_BODY);
            });
        });

        it("should throw if body is not a string", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.body({});
            }).to.throw(builder.INVALID_BODY);
        })
    });

    describe("#bodyType", function () {
        it("should change the content type", function () {
            var builder = new ContentBuilder();
            builder.discussion().body("a").subject("YO").bodyType("text/plain").build()
                .content.type.should.equal("text/plain");
        });

        it("should throw if type is empty", function () {
            var builder = new ContentBuilder();

            var invalid_types = [function () {
                builder.bodyType("");
            }, function () {
                builder.bodyType(null);
            }, function () {
                builder.bodyType();
            }];

            invalid_types.forEach(function (f) {
                expect(f).to.throw(builder.INVALID_BODY_TYPE);
            })
        })
    });

    describe("#parent", function () {
        it("should only accept Jive uris", function () {
            var builder = new ContentBuilder();
            builder.parent("/contents/1");
            builder.parent("/places/1");
            builder.parent("/people/1");

            var invalid_uris = ["a", "/a", "/a/1", "/places/ with whitespace" ];
            invalid_uris.forEach(function (uri) {
                expect(function () {
                    builder.parent(uri);
                }).to.throw(builder.INVALID_PARENT);
            });
        });
    });

    describe("#all", function () {
        it("should change visibility", function () {
            var builder = new ContentBuilder();
            builder.discussion().subject("A").body("a").all().build()
                .should.have.property("visibility").and.equal("all");
        });
    });

//    describe("#people", function () {
//        it("should change visibility", function () {
//            var builder = new ContentBuilder();
//            var content = builder.discussion().subject("A").body("a").people(["/people/1"]).build();
//
//            content.should.have.property("visibility").and.equal("people");
//            content.should.have.property("users").and.contain("glen.nicol");
//        });
//
//        it("should throw if array is not passed", function () {
//            var builder = new ContentBuilder();
//            expect(function () {
//                builder.discussion().subject("A").body("a").people();
//            }).to.throw(builder.MISSING_USERS);
//        });
//    });

    describe("#place", function () {
        it("should change visibility", function () {
            var builder = new ContentBuilder();
            var content = builder.discussion().subject("A").body("a").place("/contents/123").build();

            content.should.have.property("visibility").and.equal("place");
            content.should.have.property("parent").and.contain("/contents/123");
        });

        it("should throw if parent place is not passed", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.discussion().subject("A").body("a").place();
            }).to.throw(builder.MISSING_PARENT);
        });
    })
});