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

var jive = require("jive-sdk");
var Q = require("q");

var supportedContent = {
    DISCUSSION: "discussion",
    DOCUMENT: "document"
}

function JiveApiFacade(community, authDecorator){
    this.community = community;
    this.authenticator = authDecorator;
    this.supportedContent = supportedContent;
}

var MISSING_CONTENT_TYPE = "Missing type field.";
var MISSING_CONTENT ="Missing content field.";
var INCOMPLETE_CONTENT = "Incomplete content. Missing type or text field";
var MISSING_SUBJECT = "Missing subject field.";
function UnsupportedContentType(type){
    return "Unsupported Content Type: " + type + ".";
}

function verifyPost(post){
    var type = post.type;
    if(!type){
        throw Error(MISSING_CONTENT_TYPE);
    }
    if(!supportedContent[type.toUpperCase()]){
        throw Error(UnsupportedContentType(type));
    }
    if(!post.content){
        throw Error(MISSING_CONTENT);
    }
    if(!post.content.type || !post.content.text){
        throw Error(INCOMPLETE_CONTENT);
    }
    if(!post.subject){
        throw Error(MISSING_SUBJECT);
    }

}

function communityAPIURL(facade){
    return facade.community.jiveUrl + "/api/core/v3/";
}

function decorateResponseWithSuccess(res, correctStatus){
    res.success = res.statusCode == correctStatus;
    return res;
}

function catchErrorResponse(surround){
    return surround.catch(function (response) {
        response.success = false;
        return response;
    });
}

function decorateWithExtPropRetrievers(content, authenticator){
    content.retrieveAllExtProps = function () {
        var prop = content.resources.extprops;
        if(prop.allowed.indexOf("GET") >= 0){
            var url = prop.ref;
            var headers = {};
            authenticator.applyTo(url, null, headers);
            return jive.util.buildRequest(url, "GET", null, headers).then(function (response) {
                return content.extProps = response.entity;
            }).catch(function (error) {
                jive.logger.error(error);
            });

        }else{
            return Q.delay(0);
        }
    }
}

JiveApiFacade.prototype.create = function(post){
    verifyPost(post);
    var url = communityAPIURL(this) + "contents"
    var body = post;
    var headers = {};
    this.authenticator.applyTo(url,body, headers);
    return catchErrorResponse( jive.util.buildRequest(url, "POST", post, headers).then(function (response) {
        decorateResponseWithSuccess(response, 201)
        if(response.success){
            var url = response.entity.resources.self.ref;
            response.apiID = url.substr(url.lastIndexOf("/") + 1);
        };
        return response;
    }));
};

JiveApiFacade.prototype.delete = function(id){
    var url  = communityAPIURL(this) + "contents/" + id;
    var headers = {};
    this.authenticator.applyTo(url,null, headers);
    return catchErrorResponse( jive.util.buildRequest(url, "DELETE", null, headers).then(function (response) {
        return decorateResponseWithSuccess(response, 204);
    }));
};

JiveApiFacade.prototype.replyToDiscussion = function(discussionID, reply){
    var url = communityAPIURL(this) + "messages/contents/" + discussionID;
    var headers = {};
    this.authenticator.applyTo(url, reply, headers);
    return catchErrorResponse(
        jive.util.buildRequest(url, "POST", reply, headers).then(function (response) {
            return decorateResponseWithSuccess(response, 201);

        })
    );
};


/*
 * This is not working at the moment
 */
//JiveApiFacade.prototype.commentOn = function (contentID, comment) {
//    var url  = communityAPIURL(this) + "contents/" + contentID + "/comments"
//    var headers = {};
//    this.authenticator.applyTo(url,comment, headers);
//    return catchErrorResponse(
//        jive.util.buildRequest(url, "POST", comment, headers).then(
//            function (response) {
//                return decorateResponseWithSuccess(response, 201);
//
//            },
//            function (response) {
//                comment.type = "message";
//                return this.replyToDiscussion(contentID, comment);
//            })
//    );
//}

JiveApiFacade.prototype.attachProps = function(parentID,props){
    var url = communityAPIURL(this) + "contents/" + parentID + "/extprops";
    var headers = {};
    this.authenticator.applyTo(url, props, headers);
    return catchErrorResponse(
        jive.util.buildRequest(url, "POST", props, headers).then(function (response) {
            return decorateResponseWithSuccess(response, 201);
        })
    );
};

JiveApiFacade.prototype.getByExtProp= function (key, value) {
    var url = communityAPIURL(this) + "extprops/" + key + "/" + value;
    var headers = {};
    var authenticator = this.authenticator;
    authenticator.applyTo(url, null, headers);
    return catchErrorResponse( jive.util.buildRequest(url, "GET", null, headers).then(function (response) {
        if(response.statusCode == 200){
            response.entity.list.forEach(function (content) {
                decorateWithExtPropRetrievers(content, authenticator);
            })
            return response.entity;
        }else{
            return decorateResponseWithSuccess(response, 200);
        }
    }));
}


module.exports = JiveApiFacade;
exports.supportedContent = supportedContent;
