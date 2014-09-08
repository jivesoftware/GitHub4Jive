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

describe("TileFormatter", function(){
    var formatter = require("github4jive/TileFormatter");
    it("should not be null", function(){
       should.exist(formatter);
    });

    function createDummyArray(elements){
        var a = [];
        for(var i = 0; i < elements; i++){
            a.push(i);
        }
        return a;
    }

    describe("#formatAccordionData", function(){
        it("should return object with title and items", function(){
            var formatted = formatter.formatAccordionData("a", []);
            formatted.should.be.an("object");
            formatted.should.have.property("title");
            formatted.should.have.property("items");
        });

        it("should throw error with more than 15 items", function(){
           var sixteenElementArray = createDummyArray(16);
           expect(function(){formatter.formatAccordionData("", sixteenElementArray, {title:""});}).to.throw(formatter.AccordionItemLengthError);
        });

        it("should have items each with a property of text", function(){
            var items = createDummyArray(5);
            formatter.formatAccordionData("", items).items.forEach(function(item){
                item.should.have.property("text");
            });
        });
    });

    describe("#formatListData", function(){
        it("should return object with title and contents", function(){
            var formatted = formatter.formatListData("a", []);
            formatted.should.be.an("object");
            formatted.should.have.property("title");
            formatted.should.have.property("contents");
        });

        it("should throw error with more than 10 items", function(){
            var elevenElementArray = createDummyArray(11);
            expect(function(){formatter.formatListData("", elevenElementArray);}).to.throw(formatter.ListItemLengthError)
        });

        it("should have items each with a property of text", function(){
            var items = createDummyArray(5);
            formatter.formatListData("", items).contents.forEach(function(item){
                item.should.have.property("text");
            });
        });
    });
    
    describe("#emptyListData", function () {
        it("should return object with title and contents", function () {
            var formatted = formatter.emptyListData("a", "b");
            formatted.should.be.an("object");
            formatted.should.have.property("title");
            formatted.should.have.property("contents");
            formatted.title.should.equal("a");
        });
        
        it("should have one item with given string", function () {
            var formatted = formatter.emptyListData("a", "b");
            formatted.contents[0].should.have.property("text");
            formatted.contents[0].text.should.equal("b");
        });
    });

    describe("#formatActivityData", function () {
        it("should return object with activity, action, actor, object, and externalID", function () {
            var formatted = formatter.formatActivityData("a");
            formatted.should.have.property("activity");
            formatted.activity.should.have.property("action");
            formatted.activity.should.have.property("actor");
            formatted.activity.should.have.property("object");
            formatted.activity.should.have.property("externalID")
        });
        it("should put a headline in the object as title", function () {
            var headline = "007 kills Dr. No!";
            var formatted = formatter.formatActivityData(headline);
            formatted.activity.object.title.should.equal(headline);
        });

        it("should throw if no headline is present", function () {
            expect(function () {
                formatter.formatActivityData();
            }).to.throw(formatter.ActivityHeadlineMissing);
        })

        it("should put a description in the object as description", function () {
            var desc = "He did it by... I can't remember";
            var formatted = formatter.formatActivityData("a", desc);
            formatted.activity.object.description.should.equal(desc);
        });

        it("should put name and email into actor", function () {
            var actorName = "Sean Connery";
            var email = "sean.connery.mi6.com";
            var formatted = formatter.formatActivityData("a", "", actorName, email);
            formatted.activity.actor.name.should.equal(actorName);
            formatted.activity.actor.name.should.equal(actorName);
        });

        it("should put url into object as url", function () {
            var url = "a";
            var formatted = formatter.formatActivityData("a","", "","", url);
            formatted.activity.object.url.should.equal(url);
        });

        it("should put dateTime in externalID", function () {
            (formatter.formatActivityData("a").activity.externalID - new Date()).should.be.below(1000);
        })
    })
});