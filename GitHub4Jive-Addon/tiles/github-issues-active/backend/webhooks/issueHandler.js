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
var GitHubWebhookEventHandler = require(libDir + "github4jive/GitHubWebhookEventHandler");

var thisHandler = Object.create(GitHubWebhookEventHandler);
thisHandler.name = "Active_Issue";

module.exports = thisHandler;

/*
 * This handler pushes new GitHub state changes to the Jive activity feed.
 */

thisHandler.setup = function(setupOptions) {

    var self = this;
    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeUrl = setupOptions.placeUrl;
    var instance = setupOptions.instance;
    var auth = self.gitHubFacade.createOauthObject( setupOptions.gitHubToken);

    return self.gitHubFacade.subscribeToRepoEvent(owner, repo, self.gitHubFacade.Events.Issues, auth,
        function (payload) {
            if(notAnIgnoredAction(payload.action)) {
                var whoDunIt = payload.sender.login;
                // 1. find out who the github user is
                return self.gitHubFacade.getUserDetails(whoDunIt, auth).then(function (gitHubUser) {
                    // 2. fetch the jive discussion that corresponds to the github issue
                    return self.helpers.getDiscussionForIssue(jiveApi, placeUrl,payload.issue.id).then(function (discussion) {
                        // 3. create a Jive activity entry referencing the discussion
                        var title = formatActivityHeadline(gitHubUser, payload);
                        var formattedData = self.tileFormatter.formatActivityData(
                            title, payload.issue.body,
                            (gitHubUser.name || gitHubUser.login), gitHubUser.email,
                            (discussion ? discussion.resources.html.ref : payload.issue.html_url)
                        );
                        // 4. push the activity into Jive
                        jive.extstreams.pushActivity(instance, formattedData);
                    });
                })
            }
        }
    );
};

var IGNORED_ACTIONS = ["labeled", "unlabeled","opened"];

function notAnIgnoredAction(action){
    return IGNORED_ACTIONS.indexOf( action) < 0;
}

function formatActivityHeadline(user, payload) {
    return (user.name || user.login) + " " + payload.action + " issue: " + payload.issue.title;
}
