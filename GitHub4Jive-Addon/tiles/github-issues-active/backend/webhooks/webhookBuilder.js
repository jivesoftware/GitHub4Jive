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
var JiveApi = require(libDir + "github4jive/JiveApiFacade");
var JiveOAuth = require(libDir + "github4jive/JiveOauth");

////////////////////////////////////////////////////////////////////////////////////////////////////
// create a webhook processor and attaching event handlers to it

var issueHandler = require("./issueHandler"); // will push an external activity entry on github issue state change events

module.exports = new GitHubWebhookBuilder(
    //
    [ issueHandler ],

    // test for unique tile
    function(lhs, rhs) {
        return lhs.config.parent === rhs.config.parent;
    },

    //
    setupInstance, setupInstance
);

/**
 * docs - todo
 */
function setupInstance(tileInstance){
    var parentPlaceURL = tileInstance.config.parent;
    return placeStore.getPlaceByUrl(parentPlaceURL).then(function (place) {
        return jive.community.findByJiveURL(place.jiveUrl).then(function (community) {
            var jiveAuth = new JiveOAuth(place, place.jive.access_token, place.jive.refresh_token);
            return {
                owner: place.github.repoOwner,
                repo: place.github.repo,
                jiveApi: new JiveApi(community, jiveAuth),
                gitHubToken: place.github.token.access_token,
                placeUrl: place.placeUrl,
                instance: tileInstance
            };
        });
    });
}
