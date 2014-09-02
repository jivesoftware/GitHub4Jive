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
var helpers = require("./helpers");

var strategyBase = require("./../../../common/strategies/EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Issue";

issueStrategy.setup = function(setupOptions){

    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeID = setupOptions.placeID;
    var placeUrl = setupOptions.placeUrl;
    var auth = gitHubFacade.createOauthObject( setupOptions.gitHubToken);

    function createExtProps(gitData) {
        return {
            "github4jiveIssueId": gitData.issue.id,
            "github4jiveIssueNumber": gitData.issue.number,
            "github4jiveIssueLink": gitData.issue.html_url,
            "github4jiveIssueLabels": JSON.stringify(gitData.issue.labels),
            "github4jiveIssueClosed": gitData.issue.state == "closed"
        };
    }

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
                return jiveApi.attachProps(contentID, createExtProps(gitData));
            });

        }else if(gitData.action === "reopened"){
            helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
                return jiveApi.removeAnswer(discussion).then(function () {
                    return jiveApi.unMarkFinal(discussion.contentID).then(function () {
                        return jiveApi.attachProps(discussion.contentID, createExtProps(gitData));
                    });
                });
            });
        }else if(gitData.action === "closed"){
            helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
                return jiveApi.answer(discussion).then(function () {
                    return jiveApi.markFinal(discussion.contentID).then(function () {
                        return jiveApi.attachProps(discussion.contentID, createExtProps(gitData));
                    });
                });
            });
        }else if(gitData.action === "labeled" || gitData.action == "unlabeled"){
            helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
                var builder = new JiveContentBuilder(discussion);
                var tags = gitData.issue.labels.map(function (label) {
                    return label.name;
                })
                var content = builder.discussion()
                    .tags(tags)
                    .build();
                jiveApi.update(content).then(function (contentResponse) {
                    jive.logger.debug(contentResponse);
                });
            });
        }
    });
};
