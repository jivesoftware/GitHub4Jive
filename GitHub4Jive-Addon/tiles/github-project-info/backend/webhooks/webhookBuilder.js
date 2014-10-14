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

var libDir = process.cwd() + "/lib/";
var GitHubWebhookBuilder = require(libDir + "github4jive/GitHubWebhookBuilder");
var placeStore = require(libDir + "github4jive/placeStore");

////////////////////////////////////////////////////////////////////////////////////////////////////
// create a webhook processor and attaching event handlers to it

var issueHandler = require("./issueHandler");

module.exports = new GitHubWebhookBuilder(
    //
    [ issueHandler ],

    // test for unique tile
    function(lhs, rhs) {
        return lhs.config.parent === rhs.config.parent;
    },

    //
    setupInstance, tearDownInstance
);

/**
 * docs - todo
 */
function setupInstance(instance){
    var place = instance.config.parent;
    return placeStore.getPlaceByUrl(place).then(function (linked) {
        return {
            owner: linked.github.repoOwner,
            repo: linked.github.repo,
            gitHubToken: linked.github.token.access_token,
            placeUrl: linked.placeUrl,
            instance: instance
        };
    });
}

/**
 * docs - todo
 */
function tearDownInstance(instance) {
    var place = instance.config.parent;
    return placeStore.getPlaceByUrl(place).then(function (linked) {
        return {
            placeUrl: linked.placeUrl,
            gitHubToken: linked.github.token.access_token
        };
    });
}
