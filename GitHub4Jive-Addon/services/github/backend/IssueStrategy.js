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
var TokenPool = require("./EventTokenPool");
var helpers = require("./helpers");

var tokens = new TokenPool();

var strategyBase = require("./EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Issue";

issueStrategy.setup = function(setupOptions){

    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeID = setupOptions.placeID;
    var auth = gitHubFacade.createOauthObject( setupOptions.gitHubToken);

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth, function (gitData) {
        if(gitData.action === "opened") {
            jive.logger.info("New Issue! Creating a discussion for it.");
            var builder = new JiveContentBuilder();
            var content = builder.discussion()
                .parentPlace(placeID)
                .subject("[" + owner + "/" + repo +"-" + gitData.issue.number + "] " + gitData.issue.title)
                .body(gitData.issue.body)
                .build();
            jiveApi.create(content).then(function (contentResponse) {
                var contentID = contentResponse.apiID;
                //attach ext props to get discussion later
                return jiveApi.attachProps(contentID, {
                    "github4jiveIssueId": gitData.issue.id,
                    "github4jiveIssueNumber": gitData.issue.number
                });
            });

        }else if(gitData.action === "reopened"){
            helpers.getDiscussionForIssue(jiveApi, gitData.issue.id).then(function (discussion) {
                jiveApi.unMarkFinal(discussion.contentID);
            });
        }else if(gitData.action === "closed"){
            helpers.getDiscussionForIssue(jiveApi, gitData.issue.id).then(function (discussion) {
                jiveApi.markFinal(discussion.contentID);
            });
        }
    });
};
