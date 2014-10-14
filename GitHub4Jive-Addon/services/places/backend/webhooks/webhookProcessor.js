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
var JiveOauth = require(libDir + "github4jive/JiveOauth");
var GitHubWebhookProcessor = require(libDir + "github4jive/GitHubWebhookProcessor");
var JiveFacade = require(libDir + "github4jive/JiveApiFacade");

////////////////////////////////////////////////////////////////////////////////////////////////////
// create a webhook processor and attaching event handlers to it

var issueHandler = require("./issueHandler");               // creates Jive discussions based on GitHub issue creation event
var issueCommentHandler = require("./issueCommentHandler"); // replies to Jive discussions based on GitHub issue comment event

module.exports = new GitHubWebhookProcessor(
    //
    [ issueHandler, issueCommentHandler ],

    //
    function(lhs, rhs) {
        return lhs.placeUrl === rhs.placeUrl;
    },

    //
    linkedPlaceOptions, linkedPlaceOptions
);

/*
 * Extrudes property object used in the issue, and issue comment handlers.
 * See issueStrategy.js and issueCommentStrategy.js for how these
 * properties are used.
 *
 * Those handlers will use this function to get enough context to operate
 * on the supplied place (operate == handle incoming issues, issue comments).
 */
function linkedPlaceOptions(place) {
    var placeID = place.placeID;
    var gitHubToken = place.github.token.access_token;
    var jiveUrl = place.jiveUrl;
    var repo = place.github.repo;
    var repoOwner = place.github.repoOwner;

    var jiveAuth = new JiveOauth(place.placeUrl, place.jive.access_token, place.jive.refresh_token);
    return jive.community.findByJiveURL(jiveUrl).then(function (community) {
        var japi = new JiveFacade(community, jiveAuth);
        if (!repo || !repoOwner) {
            jive.logger.error("Missing repo information for " + place.placeUrl);
            return {};
        } else {
            var setupOptions = {
                jiveApi: japi,
                placeID: placeID,
                owner: repoOwner,
                repo: repo,
                gitHubToken: gitHubToken,
                placeUrl: place.placeUrl
            };
            return (setupOptions);
        }
    });
}
