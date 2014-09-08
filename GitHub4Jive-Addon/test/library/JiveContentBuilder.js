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
    var ContentBuilder = require("github4jive/jiveContentBuilder")

    describe("#build", function () {
        it("should return the object being built", function () {
            var builder = new ContentBuilder();
            var content = builder.document().subject("YO").body("").build();
            content.should.have.property("type");
            content.should.have.property("content");
            content.content.should.have.property("type");
        });

        it("should throw when called without a type", function () {
            var builder = new ContentBuilder();
            expect(function(){builder.build();}).to.throw(ContentBuilder.MISSING_TYPE);
        });

        it("should throw when called without calling body ", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.document().subject("YO").build();
            }).to.throw(ContentBuilder.MISSING_BODY);
        });

        it("should throw without calling subject on a document or discussion", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.document().body("").build();
            }).to.throw(ContentBuilder.MISSING_SUBJECT);
            builder.reset();
            expect(function () {
                builder.discussion().body("").build();
            }).to.throw(ContentBuilder.MISSING_SUBJECT);
        });

        it("should not throw without calling subject on a comment or message", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.comment().body("").build();
            }).to.not.throw(ContentBuilder.MISSING_SUBJECT);
            builder.reset();
            expect(function () {
                builder.message().body("").build();
            }).to.not.throw(ContentBuilder.MISSING_SUBJECT);
        })

        it("should accept callback to continue chaining", function () {
            var builder = new ContentBuilder();
            var firstContent = null;
            builder.document().subject("YO").body("").build(function (finishedContent) {
                firstContent = finishedContent;
            }).body("chaining").build().should.not.deep.equal(firstContent);
        })
    });

    describe("#reset", function () {
        it("should reset builder to new state", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.document().subject("YO").body("").reset().build();
            }).to.throw(ContentBuilder.MISSING_TYPE);
        })
    })

    describe("#document", function () {
        it("should create an object with type document", function () {
            var builder = new ContentBuilder();
            builder.document().subject("YO").body("").build().should.have.property("type").and.equal("document");
        });
    });

    describe("#discussion", function () {
        it("should create an object with type discussion", function () {
            var builder = new ContentBuilder();
            builder.discussion().subject("YO").body("").build().should.have.property("type").and.equal("discussion");
        });
    });

    describe("#subject", function () {
        it("should create a subject member",function(){
            var builder = new ContentBuilder();
            builder.discussion().body("").subject("YO").build()
                .should.have.property("subject").and.equal("YO");
        });
    })

    describe("#bodyType", function () {
        it("should change the content type", function () {
            var builder = new ContentBuilder();
            builder.discussion().body("").subject("YO").bodyType("text/plain").build()
                .content.type.should.not.equal("text/html");
        });
    });

    describe("#parent", function () {

    });

    describe("#all", function () {
        it("should change visibility", function () {
            var builder = new ContentBuilder();
            builder.document().subject("A").body("").all().build()
                .should.have.property("visibility").and.equal("all");
        });
    });

    describe("#people", function () {
        it("should change visibility", function () {
            var builder = new ContentBuilder();
            var content = builder.document().subject("A").body("").people(["glen.nicol"]).build();

            content.should.have.property("visibility").and.equal("people");
            content.should.have.property("users").and.contain("glen.nicol");
        });

        it("should throw if array is not passed", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.document().subject("A").body("").people();
            }).to.throw(ContentBuilder.MISSING_USERS);
        });
    });

    describe("#place", function () {
        it("should change visibility", function () {
            var builder = new ContentBuilder();
            var content = builder.document().subject("A").body("").place("/content/123").build();

            content.should.have.property("visibility").and.equal("place");
            content.should.have.property("parent").and.contain("/content/123");
        });

        it("should throw if parent place is not passed", function () {
            var builder = new ContentBuilder();
            expect(function () {
                builder.document().subject("A").body("").place();
            }).to.throw(ContentBuilder.MISSING_PARENT);
        });
    })



})