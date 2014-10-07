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

/*
 * This strategy modifies anything in a place that is not on a tile in response to a issue state change.
 * It could be split into separate strategies for fine grain configuration with the builder. Client code
 * should never be calling the setup function below directly. It should be called from the StrategySetBuilderBase.
 * Which is invoked from the StrategySet.setup function returned from builder.build().
 */

var jive = require("jive-sdk");

var libDir = process.cwd() + "/lib/";
var gitHubFacade = require(libDir + "github4jive/gitHubFacade");
var JiveContentBuilder = require(libDir + "github4jive/JiveContentBuilder");
var helpers = require(libDir + "github4jive/helpers");

var strategyBase = require(libDir + "github4jive/strategies/EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Place_Issue";

var POSSIBLE_GITHUB_TAGS = ["bug", "duplicate", "enhancement",  "question", "invalid", "wontfix"];

//////////////////////////////////////////////////////////////
// public

/*
 * Override of EventStrategyBase.Setup
 * SetupOptions are provided by a placeController.
 */
issueStrategy.setup = function(setupOptions){

    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeID = setupOptions.placeID;
    var placeUrl = setupOptions.placeUrl;
    var auth = gitHubFacade.createOauthObject( setupOptions.gitHubToken);
  

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth, function (gitData) {
        switch(gitData.action) {
            case "opened": // Issue just created on GitHub
                createIssueDiscussion(placeID, gitData, jiveApi);
                break;
            case "reopened":
                reopenDiscussion(jiveApi, placeUrl, gitData);
                break;
            case "closed":
                closeDiscussion(jiveApi, placeUrl, gitData);
                break;
            case "labeled":
            case "unlabeled":
                updateDiscussionTags(jiveApi, placeUrl, gitData);
                break
        }
    });
};

//////////////////////////////////////////////////////////////
// private helpers

function createExtProps(gitData) {
    return {
        "github4jiveIssueId": gitData.issue.id,
        "github4jiveIssueNumber": gitData.issue.number,
        "github4jiveIssueLink": gitData.issue.html_url,
        "github4jiveIssueLabels": JSON.stringify(gitData.issue.labels),
        "github4jiveIssueClosed": gitData.issue.state == "closed"
    };
}

function editGitHubTags(discussion, gitData) {
    var tags = discussion.tags.filter(function (tag) {//Grab all tags on the discussion that are not GitHub labels
        return POSSIBLE_GITHUB_TAGS.indexOf(tag) < 0;
    });
    gitData.issue.labels.forEach(function (label) {//Then add all labels currently on the issue
        tags.push(label.name);
    });
    return tags;
}

function formatDiscussionSubject(gitData) {
    return "[" + gitData.repository.full_name + "-" + gitData.issue.number + "] " + gitData.issue.title;
}

function createIssueDiscussion(placeID, gitData, jiveApi) {
    jive.logger.info("New Issue! Creating a discussion for it.");
    var builder = new JiveContentBuilder();
    var content = builder.discussion()
                        .parentPlace(placeID)
                        .subject(formatDiscussionSubject(gitData))
                        .body(gitData.issue.body)
                        .build();
    jiveApi.create(content).then(function (contentResponse) {
        var contentID = contentResponse.apiID;
        //attach ext props to query for discussion later
        return jiveApi.attachPropsToContent(contentID, createExtProps(gitData));
    });
}

function reopenDiscussion(jiveApi, placeUrl, gitData) {
    helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        return jiveApi.removeAnswer(discussion).then(function () {
            return jiveApi.unMarkFinal(discussion.contentID).then(function () {
                return jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
            });
        });
    });
}

function closeDiscussion(jiveApi, placeUrl, gitData) {
    helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        return jiveApi.answer(discussion).then(function () {
            return jiveApi.markFinal(discussion.contentID).then(function () {
                return jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
            });
        });
    });
}

function updateDiscussionTags(jiveApi, placeUrl, gitData) {
    helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
        var tags = editGitHubTags(discussion, gitData);
        var builder = new JiveContentBuilder(discussion);
        var content = builder.discussion()
            .tags(tags)
            .build();
        jiveApi.update(content).then(function (contentResponse) {
            jive.logger.debug(contentResponse);
        });
    });
}
