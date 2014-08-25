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

function getDiscussionUrl(jiveApi, message){
    return jiveApi.get(message.id).then(function (m) {
        return m.entity.discussion;
    });
}

function processPayload(hookPayload)
{
    var place = hookPayload.target.id;
    var event = hookPayload.verb;
    var comment = hookPayload.object.summary;
    jive.logger.debug(comment);
    if(event == "jive:replied" && comment.indexOf("<!--GitHub-->") != 0){//Check for a comment created from GitHub

        return placeStore.getPlaceByUrl(place).then(function (linked) {
            if(!linked || !linked.github || !linked.github.repo || !linked.github.repoOwner){
                return jive.webhooks.findByWebhookURL(jive.service.serviceURL() + '/webhooks?place='+ encodeURIComponent( place)).then(function (webhook) {
                    return jive.webhooks.unregister(webhook);
                })
            }

            return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
                var jiveAuth = new JiveOauth(linked.jive.access_token, linked.jive.refresh_token, function (newTokens) {
                    jive.logger.info("Refreshing Jive tokens for: "+ linked.placeUrl);
                    jiveAuth = new JiveOauth(newTokens.access_token, newTokens.refresh_token, this)
                    return placeStore.save(linked.placeUrl,{jive:newTokens});
                });

                var japi = new JiveApi(community,jiveAuth);
//                japi.getAllExtProps(hookPayload.object.id).then(function (commentProps) {
//                    if(!commentProps.fromGitHub){
//                        return q(function () {
//                            return;
//                        })
//                    }
                    return getDiscussionUrl(japi, hookPayload.object).then(function (discussion) {
                        return japi.getAllExtProps(discussion).then(function (props) {
                            var issueNumber = props.github4jiveIssueNumber;
                            if(!issueNumber){//Discussion is not linked to an issue
                                return;
                            }
                            comment = "<!--Jive-->\n" + comment;
                            var auth = gitFacade.createOauthObject(linked.github.token.access_token);
                            return gitFacade.addNewComment(linked.github.repoOwner, linked.github.repo,issueNumber, comment, auth).then(function (response) {
                            })
                        });
                    });
//                });



            });

        });
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
        res.writeHead(204, { 'Content-Type': 'application/json' });
        res.end();
    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    });


}