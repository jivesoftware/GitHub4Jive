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

var gitHubFacade = require("github4jive/gitHubFacade");
var JiveContentBuilder = require("github4jive/JiveContentBuilder");
var tileFormatter = require("github4jive/tileFormatter");
var helpers = require("github4jive/helpers");

var strategyBase = require("github4jive/strategies/EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Active_Issue";

var IGNORED_ACTIONS = ["labeled", "unlabeled","opened"];

/*
 * This strategy pushes new state changes to the activity feed.
 * Client code should never be calling this function directly. It should be called from the StrategySetBuilderBase.
 * Which is invoked from the StrategySet.setup function returned from builder.build().
 *
 * Override of EventStrategyBase.Setup
 * SetupOptions are provided by a placeController.
 *
 */
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


            if(IGNORED_ACTIONS.indexOf( payload.action) < 0) {
                var whoDunIt = payload.sender.login;
                return gitHubFacade.getUserDetails(whoDunIt, auth).then(function (user) {
                    return helpers.getDiscussionForIssue(jiveApi, placeUrl,payload.issue.id).then(function (discussion) {
                        var title = (user.name || user.login) + " " + payload.action + " issue: " + payload.issue.title;
                        var formattedData = tileFormatter.formatActivityData(
                            title, payload.issue.body, (user.name || user.login), user.email, discussion.resources.html.ref);
                        jive.extstreams.pushActivity(instance, formattedData);
                    });
                })
            }
        });
};