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

var https = require("https");
var url = require('url');
var jive = require("jive-sdk");
var q = require("q");
var gitFacade = require("../../../../common/GitHubFacade");
var JiveApi = require("../../../../common/JiveApiFacade");
var JiveOauth = require("../../../../common/JiveOauth");
var placeStore = require("../../../../common/PlaceStore");


exports.placeCurrentConfig = function (req, res) {
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    if(!placeUrl || placeUrl === ""){
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify("Specify place api url"));
    }
    placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        var clientSideConfig = {github: false, jive: false};
        try{
            if(linked.github.token.access_token){
                clientSideConfig.github = true;
            }
        }catch(e){

        }
        try{
            if(linked.jive.access_token){
                clientSideConfig.jive = true;
            }
        }catch(e){

        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clientSideConfig));
    }).catch(function (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    })
};

exports.basicTileConfig = function (req, res) {
    res.render('../../../public/configuration.html', { host: jive.service.serviceURL()  });
};

function getDiscussionUrl(message){
    return message.discussion;
}

function getPlace(place) {
    return placeStore.getPlaceByUrl(place).then(function (linked) {
        if (!linked || !linked.github || !linked.github.repo || !linked.github.repoOwner) {
            return jive.webhooks.findByWebhookURL(jive.service.serviceURL() + '/webhooks?place=' +
                encodeURIComponent(place)).then(function (webhook) {
                return jive.webhooks.unregister(webhook);
            })
        }
        return linked;
    });
}
function getJiveApi(linked) {
    return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
        var jiveAuth = new JiveOauth(linked.placeUrl,linked.jive.access_token, linked.jive.refresh_token);
        var japi = new JiveApi(community, jiveAuth);
        return japi;
    });
}
function hydrateObject(japi, webHookObject) {
    return japi.get(webHookObject.id).then(function (message) {
        return message.entity;
    });
}
function createGitHubComment(place, hookPayload) {
    var comment = hookPayload.object;
    return getPlace(place).then(function (linked) {
        return getJiveApi(linked).then(function (japi) {
            return hydrateObject(japi, comment).then(function (message) {
            return message.retrieveAllExtProps().then(function (commentprops) {

                    if (commentprops.fromGitHub) {//Check for a comment created from GitHub
                        return q(function () {
                            return;
                        })
                    }
                    var discussion = getDiscussionUrl(message);
                    return japi.getAllExtProps(discussion).then(function (props) {
                        var issueNumber = props.github4jiveIssueNumber;
                        if (!issueNumber) {//Discussion is not linked to an issue
                            return;
                        }
                        return japi.get(hookPayload.object.author.id).then(function (user) {
                            user = user.entity;
                            var userPage = user.resources.html.ref;
                            var gitComment = "<!--Jive-->\n[[Jive](" + japi.community.jiveUrl + ") - [" +
                                user.displayName +
                                "](" + userPage + ")] " + hookPayload.object.summary;
                            var auth = gitFacade.createOauthObject(linked.github.token.access_token);
                            return gitFacade.addNewComment(linked.github.repoOwner, linked.github.repo,
                                issueNumber, gitComment, auth).then(function (response) {
                                })
                        })

                    });

                })
            });
        });


    });
}

function setGitHubIssueState(linked,japi,discussionUrl,props,shouldClose)
{
    props.github4jiveIssueClosed = props.github4jiveIssueClosed ? JSON.parse(props.github4jiveIssueClosed) : false;
    if(props.github4jiveIssueNumber && Boolean(shouldClose) !== Boolean(props.github4jiveIssueClosed)){
        var auth = gitFacade.createOauthObject(linked.github.token.access_token);
        props.github4jiveIssueClosed = shouldClose;
        var state = props.github4jiveIssueClosed ? "closed" : "open";
        return gitFacade.changeIssueState(linked.github.repoOwner, linked.github.repo,
            props.github4jiveIssueNumber, state, auth).then(function () {
                return japi.attachPropsToContent(discussionUrl, props);
            });
    }else {
        return;
    }
}
function processPayload(hookPayload)
{
    var place = hookPayload.target.id;
    var event = hookPayload.verb;
    var obj = hookPayload.object;
    jive.logger.debug(hookPayload.object);
    if(event == "jive:replied" ){
        return createGitHubComment(place, hookPayload);
    }else if(event == "jive:outcome_set" || event == "jive:correct_answer_set" || event == "jive:outcome_removed" || event ==  "jive:correct_answer_removed"){
        if(event == "jive:outcome_set"){
            return getPlace(place).then(function (linked) {
                return getJiveApi(linked).then(function (japi) {
                    return hydrateObject(japi, obj).then(function (discussion) {
                        return discussion.retrieveAllExtProps().then(function (discussionProps) {
                            return setGitHubIssueState(linked,japi,discussion.resources.self.ref,discussionProps,discussion.outcomeCounts ? discussion.outcomeCounts.finalized : false);
                        });
                    });
                });
            });
        }else  if (obj.objectType == "jive:message"){
                return getPlace(place).then(function (linked) {
                    return getJiveApi(linked).then(function (japi) {
                        return hydrateObject(japi, obj).then(function (message) {
                            var discussion = getDiscussionUrl(message);
                            return japi.getAllExtProps(discussion).then(function (props) {
                                return setGitHubIssueState(linked,japi,discussion,props,!!message.answer);
                            });
                        });
                    });
                });

        }else{
            return q(function () {
                return;
            });
        }
    }else{
        return q(function () {
            return;
        });
    }
};

function sequentiallyProcessPayloads(payloads, index){
    var payload = payloads[index];
    if(!payload){
        return q(function () {
            return;
        })
    }
    return processPayload(payload.activity).then(function () {
        return sequentiallyProcessPayloads(payloads, ++index);
    })
}

exports.webHookPortal = function (req, res) {
    var hookPayloads = req.body.sort(function (a,b) {
            return new Date(a.activity.published).getTime() - new Date(b.activity.published).getTime();
    });
    sequentiallyProcessPayloads(hookPayloads, 0).then(function () {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    });


}