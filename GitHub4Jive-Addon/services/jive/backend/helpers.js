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
var placeStore = require("github4jive/placeStore");
var JiveApi = require("github4jive/JiveApiFacade");
var JiveOauth = require("github4jive/JiveOauth");

/*
 * get the parent discussion url from a message object
 * @param {object} message an api object
 * @return {string} discussion api url
 */
exports.getDiscussionUrl = function (message){
    return message.discussion;
};

function configurationIsInvalid(linked) {
    return !linked || !linked.github || !linked.github.repo || !linked.github.repoOwner;
}

/*
 * get the current configuration for a place. Also, if the place has poor configuration then the webhook is unregistered.
 * @param {string} placeUrl api url of the place
 * @return {promise} with place configuration
 */
exports.getPlace = function (placeUrl) {
    return placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        if (configurationIsInvalid(linked)) {
            return jive.webhooks.findByWebhookURL(jive.service.serviceURL() + '/webhooks?place=' +
                encodeURIComponent(place)).then(function (webhook) {
                return jive.webhooks.unregister(webhook);
            })
        }
        return linked;
    });
};

/*
 * get a JiveApiFacade instance that can interact with the linked place
 * @param {object} linked the configuration object that represents a linked place
 * @return {promise} with new JiveApiFacade instance
 */
exports.getJiveApi = function (linked) {
    return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
        var jiveAuth = new JiveOauth(linked.placeUrl,linked.jive.access_token, linked.jive.refresh_token);
        return new JiveApi(community, jiveAuth);
    });
};

/*
 * retrieve the full api entity from the Jive instance
 * @param {JiveApiFacade} japi
 * @param {object} webhookObject the shallow record that represents the full api entity
 * @return {promise} with full api entity
 */
exports.hydrateObject = function (japi, webHookObject) {
    return japi.get(webHookObject.id).then(function (message) {
        return message.entity;
    });
};