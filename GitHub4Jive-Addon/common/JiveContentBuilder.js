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

function JiveContentBuilder(){
    this.content = {content:{type:"text/html"}};
}

var MISSING_TYPE = exports.MISSING_TYPE ="Missing type";
var MISSING_SUBJECT = exports.MISSING_SUBJECT = "Missing subject";
var MISSING_BODY = exports.MISSING_BODY = "Content text missing";
var MISSING_USERS = exports.MISSING_USERS = "Missing user list.";
var MISSING_PARENT = exports.MISSING_PARENT = "Missing parent uri";

function verify(builder) {
    if(!builder.content.type){
        throw Error(MISSING_TYPE);
    }
    if(builder.content.subject == null && builder.content.type != "comment" && builder.content.type != "message"){
        throw Error(MISSING_SUBJECT);
    }
    if(builder.content.content.text == null){
        throw Error(MISSING_BODY);
    }
}

JiveContentBuilder.prototype.build = function(onBuild){
    verify(this);
    if(onBuild){
        onBuild(JSON.parse(JSON.stringify(this.content)));
        return this;
    }else{
        return this.content;
    }
};

JiveContentBuilder.prototype.reset = function () {
    this.content = {content:{type:"text/html"}};
    return this;
}

JiveContentBuilder.prototype.document = function(){
    this.content.type = "document";
    return this;
};

JiveContentBuilder.prototype.discussion = function(){
    this.content.type = "discussion";
    return this;
};

JiveContentBuilder.prototype.comment = function(){
    this.content.type = "comment";
    return this;
};

JiveContentBuilder.prototype.message = function(){
    this.content.type = "message";
    return this;
};

JiveContentBuilder.prototype.file = function(){
    this.content.type = "file";
    return this;
};

JiveContentBuilder.prototype.poll = function(){
    this.content.type = "poll";
    return this;
};

JiveContentBuilder.prototype.post = function(){
    this.content.type = "post";
    return this;
};

JiveContentBuilder.prototype.favorite = function(){
    this.content.type = "favorite";
    return this;
};

JiveContentBuilder.prototype.task = function(){
    this.content.type = "task";
    return this;
};

JiveContentBuilder.prototype.update = function(){
    this.content.type = "update";
    return this;
};

JiveContentBuilder.prototype.subject = function(subject){
    this.content.subject = subject;
    return this;
};

JiveContentBuilder.prototype.body = function(body){
    this.content.content.text = body;
    return this;
};

JiveContentBuilder.prototype.bodyType = function(type){
    this.content.content.type = type;
    return this;
};

JiveContentBuilder.prototype.parent = function(parentURI){
    this.content.parent = parentURI;
    return this;
};

JiveContentBuilder.prototype.parentContent = function (parentID) {
    this.content.parent = "/contents/"+parentID;
    return this;
}

JiveContentBuilder.prototype.all = function(){
    this.content.visibility = "all";
    return this;
};

JiveContentBuilder.prototype.people = function(users){
    if(!users || users.length < 1){
        throw Error(MISSING_USERS);
    }
    this.content.visibility = "people";
    this.content.users = users;
    return this;
};

JiveContentBuilder.prototype.place = function (placeURI) {
    if(!placeURI || placeURI.length < 1){
        throw Error(MISSING_PARENT);
    }
    this.content.visibility = "place";
    this.content.parent = placeURI;
    return this;
};


module.exports = JiveContentBuilder;

