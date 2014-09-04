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

var gitHubFacade = require("../../../common/GitHubFacade");
var JiveContentBuilder = require("../../../common/JiveContentBuilder");
var tileFormatter = require("../../../common/TileFormatter");

var strategyBase = require("./../../../common/strategies/EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Issue";

issueStrategy.setup = function(setupOptions) {

    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeID = setupOptions.placeID;
    var placeUrl = setupOptions.placeUrl;
    var instance = setupOptions.instance;
    var auth = gitHubFacade.createOauthObject( setupOptions.gitHubToken);

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth,
        function (payload) {

            var whoDunIt = payload.sender.login;
            return gitHubFacade.getUserDetails(whoDunIt,auth).then(function (user) {
                var title =  (user.name  || user.login) + " " + payload.action + " issue: " + payload.issue.title;
                var formattedData = tileFormatter.formatActivityData(
                    title, payload.issue.body, (user.name || user.login) , user.email, payload.issue.html_url);
                jive.extstreams.pushActivity(instance, formattedData);
            })

        });
};