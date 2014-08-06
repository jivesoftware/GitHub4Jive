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

function decorateWithExtPropRetrievers(community, content, authenticator){
    content.retrieveAllExtProps = function () {
        var prop = content.resources.extprops;
        if(prop.allowed.indexOf("GET") >= 0){
            var url = prop.ref;
            var headers = {};
            var options = authenticator.applyTo(url, null, headers);
            options['method'] = 'GET';
            return jive.community.doRequest(community, options).then(function (response) {
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
    var url = communityAPIURL(this) + "contents";
    var headers = {};
    var options = this.authenticator.applyTo(url,post, headers);
    options['method'] = 'POST';
    return catchErrorResponse( jive.community.doRequest(this.community, options ).then(function (response) {
        decorateResponseWithSuccess(response, 201);
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
    var options = this.authenticator.applyTo(url,null, headers);
    options['method'] = 'DELETE';
    return catchErrorResponse( jive.community.doRequest(this.community, options ).then(function (response) {
        return decorateResponseWithSuccess(response, 204);
    }));
};

JiveApiFacade.prototype.replyToDiscussion = function(discussionID, reply){
    var url = communityAPIURL(this) + "messages/contents/" + discussionID;
    var headers = {};
    var options = this.authenticator.applyTo(url, reply, headers);
    options['method'] = 'POST';
    return catchErrorResponse(
        jive.community.doRequest(this.community, options ).then(function (response) {
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
//    var options = this.authenticator.applyTo(url,comment, headers);
//    options['method'] = 'POST';
//    return catchErrorResponse(
//        jive.community.doRequest(this.community, options ).then(
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
    var options = this.authenticator.applyTo(url, props, headers);
    options['method'] = 'POST';
    return catchErrorResponse(
        jive.community.doRequest(this.community, options ).then(function (response) {
            return decorateResponseWithSuccess(response, 201);
        })
    );
};

JiveApiFacade.prototype.getByExtProp= function (key, value) {
    var url = communityAPIURL(this) + "extprops/" + key + "/" + value;
    var headers = {};
    var authenticator = this.authenticator;
    var options = authenticator.applyTo(url, null, headers);
    options['method'] = 'GET';
    var community = this.community;
    return catchErrorResponse( jive.community.doRequest(this.community, options ).then(function (response) {
        if(response.statusCode == 200){
            response.entity.list.forEach(function (content) {
                decorateWithExtPropRetrievers(community, content, authenticator);
            })
            return response.entity;
        }else{
            return decorateResponseWithSuccess(response, 200);
        }
    }));
}


module.exports = JiveApiFacade;
exports.supportedContent = supportedContent;
