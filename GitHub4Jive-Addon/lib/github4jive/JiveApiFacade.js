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
var q = require("q");

var supportedContent = {
    DISCUSSION: "discussion",
    DOCUMENT: "document"
};

/**
 * Creates an API interface for a specific Jive Community with an authenticator
 * @param object community used to get url of Jive instance. Object must have JiveUrl property
 * @param object authDecorator This authenticator must have an applyTo function that
 * takes the url, body, and headers of a request and provides authentication for Jive by modifying those objects
 * @return object JiveApiFacade object
 */

function JiveApiFacade(community, authDecorator) {
    if (!community.jiveUrl || !(typeof community.jiveUrl === "string")) {
        throw Error("Invalid Jive url in community");
    }
    if (!authDecorator.applyTo || !(authDecorator.applyTo instanceof Function)) {
        throw Error("Invalid Jive authenticator");
    }
    this.community = community;
    this.authenticator = authDecorator;
    this.supportedContent = supportedContent;
}

var MISSING_CONTENT_TYPE = "Missing type field.";
var MISSING_CONTENT = "Missing content field.";
var INCOMPLETE_CONTENT_TEXT_TYPE = "Incomplete content. Missing text type field";
var MISSING_SUBJECT = "Missing subject field.";

/**
 * @return {string}
 */
function UnsupportedContentType(type) {
    return "Unsupported Content Type: " + type + ".";
}

function verifyPost(post) {
    var type = post.type;
    if (!type) {
        throw Error(MISSING_CONTENT_TYPE);
    }
    if (!supportedContent[type.toUpperCase()]) {
        throw Error(UnsupportedContentType(type));
    }
    if (!post.content) {
        throw Error(MISSING_CONTENT);
    }
    if (!post.content.type) {
        throw Error(INCOMPLETE_CONTENT_TEXT_TYPE);
    }
    if (!post.subject) {
        throw Error(MISSING_SUBJECT);
    }

}

function communityAPIURL(facade) {
    return facade.community.jiveUrl + "/api/core/v3/";
}

function decorateResponseWithSuccess(res, correctStatus) {
    res.success = res.statusCode == correctStatus;
    return res;
}

function catchErrorResponse(surround) {
    return surround.catch(function (response) {
        response.success = false;
        try {
            response.error = response.details.entity;
        } catch (e) {
        }
        return response;
    });
}

function decorateWithExtPropRetrievers(community, content, authenticator) {
    content.retrieveAllExtProps = function () {
        var prop = content.resources.extprops;
        if (prop.allowed.indexOf("GET") >= 0) {
            var url = prop.ref;
            var headers = {};
            var options = authenticator.applyTo(url, null, headers);
            options['method'] = 'GET';
            return jive.community.doRequest(community, options).then(function (response) {
                return content.extProps = response.entity;
            }).catch(function (error) {
                jive.logger.error(error);
            });

        } else {
            return q();
        }
    }
}

/**
 * get a Jive api object by its url
 * @param {string} url of the Jive api object
 * @return {object} Jive api object
 */
JiveApiFacade.prototype.get = function (url) {
    var headers = {};
    var options = this.authenticator.applyTo(url, null, headers);
    options['method'] = 'GET';
    var community = this.community;
    var authenticator = this.authenticator;
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        decorateResponseWithSuccess(response, 200);
        if (response.success) {
            if (!response.entity.list) {
                var url = response.entity.resources.self.ref;
                response.apiID = url.substr(url.lastIndexOf("/") + 1);
                decorateWithExtPropRetrievers(community, response.entity, authenticator);
            }
        }
        return response;
    }));

};

/**
 * Create new content in the Jive community
 * @param object post Jive API payload to create content. JiveContentBuilder makes this easy.
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 */

JiveApiFacade.prototype.create = function (post) {
    verifyPost(post);
    var url = communityAPIURL(this) + "contents";
    var headers = {};
    var options = this.authenticator.applyTo(url, post, headers);
    options['method'] = 'POST';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        decorateResponseWithSuccess(response, 201);
        if (response.success) {
            var url = response.entity.resources.self.ref;
            response.apiID = url.substr(url.lastIndexOf("/") + 1);
        }
        return response;
    }));
};

/**
 * Update an api resource.
 * @param {object} put the object to be PUT(updated) back onto the server
 * @return {promise} the response from the update operation
 */

JiveApiFacade.prototype.update = function (put) {
    var url = put.resources.self.ref;
    var headers = {};
    var options = this.authenticator.applyTo(url, put, headers);
    options['method'] = 'PUT';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        decorateResponseWithSuccess(response, 200);
        if (response.success) {
            var url = response.entity.resources.self.ref;
            response.apiID = url.substr(url.lastIndexOf("/") + 1);
        }
        return response;
    }));
};

/**
 * Delete content form the Jive community by its reference
 * @param string id The content id to be deleted.
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 */
JiveApiFacade.prototype.destroy = function (id) {
    var url = communityAPIURL(this) + "contents/" + id;
    var headers = {};
    var options = this.authenticator.applyTo(url, null, headers);
    options['method'] = 'DELETE';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        return decorateResponseWithSuccess(response, 204);
    }));
};

/**
 * Reply to a discussion using that discussions ID and a reply payload
 * as described by the Jive API. Use JiveContentBuilder Message to create easily.
 * @param string discussionID The reference for the discussion to reply to
 * @param object reply Jive API payload for a discussion message. JiveContentBuilder Message will make this easy.
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 *
 */
JiveApiFacade.prototype.replyToDiscussion = function (discussionID, reply) {
    var url = communityAPIURL(this) + "messages/contents/" + discussionID;
    var headers = {};
    var options = this.authenticator.applyTo(url, reply, headers);
    options['method'] = 'POST';
    return catchErrorResponse(
        jive.community.doRequest(this.community, options).then(function (response) {
            return decorateResponseWithSuccess(response, 201);

        })
    );
};

/**
 * Attach and replace external properties to a piece of content. Retrieve current ext props
 * and append/modify to save other properties
 * @param string parentID The contentID for the content to attach properties to
 * @param object props All fields will be converted to properties
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 */

JiveApiFacade.prototype.attachPropsToContent = function (parentID, props) {
    var url = communityAPIURL(this) + "contents/" + parentID;
    if (parentID.indexOf("http") == 0) {//if full id is passed in
        url = parentID;
    }
    url += "/extprops";
    var headers = {};
    var options = this.authenticator.applyTo(url, props, headers);
    options['method'] = 'POST';
    return catchErrorResponse(
        jive.community.doRequest(this.community, options).then(function (response) {
            return decorateResponseWithSuccess(response, 201);
        })
    );
};

/**
 * Attach and replace external properties on a discussion replyRetrieve current ext props
 * and append/modify to save other properties
 * @param string message ID
 * @param object props All fields will be converted to properties
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 */
JiveApiFacade.prototype.attachPropsToReply = function (parentID, props) {
    var url = communityAPIURL(this) + "messages/" + parentID + "/extprops";
    var headers = {};
    var options = this.authenticator.applyTo(url, props, headers);
    options['method'] = 'POST';
    return catchErrorResponse(
        jive.community.doRequest(this.community, options).then(function (response) {
            return decorateResponseWithSuccess(response, 201);
        })
    );
};

/**
 * Retrieve a list of object by external property and value
 * @param string key The external property to query on
 * @param string value The value of the external property to look for
 * @return {Promise} promise Use .then(function(result){}); to process return asynchronously
 */

JiveApiFacade.prototype.getByExtProp = function (key, value) {
    var url = communityAPIURL(this) + "extprops/" + key + "/" + value;
    var headers = {};
    var authenticator = this.authenticator;
    var options = authenticator.applyTo(url, null, headers);
    options['method'] = 'GET';
    var community = this.community;
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        if (response.statusCode == 200) {
            response.entity.list.forEach(function (content) {
                decorateWithExtPropRetrievers(community, content, authenticator);
            });
            return response.entity;
        } else {
            return decorateResponseWithSuccess(response, 200);
        }
    }));
};

/**
 * Get all external properties attached to given uri. This simply gets the object at the uri
 * and then uses it's resources member to retrieve the external properties.
 * @param {string} uri The uri or full uri that corresponds to an api resource.
 * @return {promise} promise contains the external properties object or an erroneous response
 */
JiveApiFacade.prototype.getAllExtProps = function (uri) {

    var url = communityAPIURL(this) + uri;
    if (uri.indexOf("http") == 0) {
        url = uri;
    }
    var headers = {};
    var options = this.authenticator.applyTo(url, null, headers);
    options["method"] = "GET";
    var community = this.community;
    var authenticator = this.authenticator;
    return catchErrorResponse(jive.community.doRequest(community, options).then(function (response) {
        decorateResponseWithSuccess(response, 200);
        if (response.success) {
            decorateWithExtPropRetrievers(community, response.entity, authenticator);
            return response.entity.retrieveAllExtProps();
        } else {
            return response;
        }

    }));
};

/**
 * Mark a particular piece of content as final. It does no check for possible outcome types.
 * At this point in time its only use is for discussions which can always be marked final. If the content is already
 * marked final than this succeeds.
 * @param {string} contentID the id of the piece of content to be marked final
 * @return {promise} the response is returned in the promise
 */
JiveApiFacade.prototype.markFinal = function (contentID) {
    var url = communityAPIURL(this) + "contents/" + contentID + "/outcomes";
    var headers = {};
    var body = {"outcomeType": {"id": 2}};
    var options = this.authenticator.applyTo(url, body, headers);
    options['method'] = 'POST';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        return decorateResponseWithSuccess(response, 201);
    }));
};

/**
 * Retrieve the outcomes that are currently on a piece of content.
 * @param {string} contentID the id of the piece of content to be marked final
 * @return {promise} the response is returned in the promise
 */
JiveApiFacade.prototype.getOutcomes = function (contentID) {
    var url = communityAPIURL(this) + "contents/" + contentID + "/outcomes";
    var headers = {};
    var options = this.authenticator.applyTo(url, null, headers);
    options['method'] = 'GET';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        return decorateResponseWithSuccess(response, 200);
    }));
};

/**
 * Remove the final outcome from a piece of content. If it was not already marked than it returns true.
 * @param {string} contentID the id of the piece of content to be marked final
 * @return {promise} the response is returned. Except when the content was not already marked a simple object with field success is returned.
 */
JiveApiFacade.prototype.unMarkFinal = function (contentID) {
    var community = this.community;
    var url = communityAPIURL(this) + "outcomes/";
    var authenticator = this.authenticator;
    return this.getOutcomes(contentID).then(function (outcomes) {

        var outcomeId = null;
        outcomes.entity.list.forEach(function (outcome) {
            if (outcome.outcomeType.name == "finalized") {
                outcomeId = outcome.id;
                return false;//break out of foreach
            }
        });
        if (outcomeId == null) {//was not marked final return successful
            return {success: true};
        }
        url += outcomeId;
        var headers = {};
        var options = authenticator.applyTo(url, null, headers);
        options['method'] = 'DELETE';
        return catchErrorResponse(jive.community.doRequest(community, options).then(function (response) {
            return decorateResponseWithSuccess(response, 204);
        }));
    });
};

/**
 * Mark a discussion assumed answered.
 * @param {object} discussion. Must pass entire object because the object is modified and then PUT
 * back onto the server.
 * @return {promise} returns the response from the PUT operation
 */
JiveApiFacade.prototype.answer = function (discussion) {
    if (!discussion.question) {
        throw Error("This discussion is not a question.");
    }
    var url = discussion.resources.self.ref;
    var headers = {};
    discussion.resolved = "assumed_resolved";
    var body = discussion
    var options = this.authenticator.applyTo(url, body, headers);
    options['method'] = 'PUT';
    return catchErrorResponse(jive.community.doRequest(this.community, options).then(function (response) {
        return decorateResponseWithSuccess(response, 200);
    }));
};

function unMarkAnsweredComment(community, authenticator, comment) {
    comment.answer = false;
    var headers = {};
    var options = authenticator.applyTo(comment.resources.self.ref, comment, headers);
    options['method'] = 'PUT';
    return catchErrorResponse(jive.community.doRequest(community, options).then(function (response) {
        return decorateResponseWithSuccess(response, 200);
    }));
}

function getTemporaryAnswer(api, discussion, messages) {
    if (messages.entity.list.length == 0) {// stupid api design makes it possible to undo assumed resolved but only with a comment in place.
        var blank = {type: "message", content: {type: "text/html", text: ""}};
        return api.replyToDiscussion(discussion.contentID, blank).then(function (comment) {
            return comment.entity;
        });
    } else {
        return  q(messages.entity.list[0]);

    }
}
/**
 * Remove the current answer on a discussion either assumed or specified reply.
 * NOTE: Due to an api restriction, state cannot be immediately reset to open. To get around this,
 * the first reply is marked as the answer and then unmarked. This resets the discussion to open.
 * If there is no replies when this is called than a reply will be created.
 * @param {object} discussion. Must pass entire object because the object is modified and then PUT
 * back onto the server.
 * @
 */
JiveApiFacade.prototype.removeAnswer = function (discussion) {
    if (!discussion.question) {
        throw Error("This discussion is not a question.");
    }
    if (discussion.resolved == "open") {
        return q(function () {
            return {success: true, entity: discussion};
        });
    }

    var headers = {};
    var community = this.community;
    var authenticator = this.authenticator;
    var self = this;
    if (discussion.answer) {
        return self.get(discussion.answer).then(function (comment) {
            return unMarkAnsweredComment(community, authenticator, comment.entity);
        });
    } else {

        return this.get(discussion.resources.messages.ref).then(function (messages) {
            return getTemporaryAnswer(self, discussion, messages).then(function (tempAnswer) {
                tempAnswer.answer = true;
                var options = authenticator.applyTo(tempAnswer.resources.self.ref, tempAnswer, headers);
                options['method'] = 'PUT';
                return catchErrorResponse(jive.community.doRequest(community, options).then(function (response) {
                    return unMarkAnsweredComment(community, authenticator, response.entity);
                }));
            });
        })
    }
};

module.exports = JiveApiFacade;
exports.supportedContent = supportedContent;
