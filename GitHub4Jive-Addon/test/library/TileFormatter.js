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
    var formatter = require("../../common/TileFormatter");
    it("should not be null", function(){
       should.exist(formatter);
    });

    describe("#formatAccordionData", function(){
        it("should return object with title and items", function(){
            var formatted = formatter.formatAccordionData("a", []);
            formatted.should.be.an("object");
            formatted.should.have.property("title");
            formatted.should.have.property("items");
        });

        function createDummyArray(elements){
            var a = [];
            for(var i = 0; i < elements; i++){
                a.push(i);
            }
            return a;
        }

        it("should throw error with more than 15 items", function(){
           var sixteenElementArray = createDummyArray(16);
           expect(function(){formatter.formatAccordionData("", sixteenElementArray, {title:""});}).to.throw(formatter.FormatException);
        });

        it("should have items each with a property of text", function(){
            var items = createDummyArray(5);
            formatter.formatAccordionData("", items).items.forEach(function(item){
                item.should.have.property("text");
            });
        });
    });
});