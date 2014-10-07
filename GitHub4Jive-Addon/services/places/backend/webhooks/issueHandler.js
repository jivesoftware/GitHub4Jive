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
 * This handler modifies anything in a place that is not on a tile in response to a issue state change.
 */

var jive = require("jive-sdk");

var libDir = process.cwd() + "/lib/";
var GitHubWebhookEventHandler = require(libDir + "github4jive/GitHubWebhookEventHandler");
var thisHandler = Object.create(GitHubWebhookEventHandler);
thisHandler.name = "Place_Issue";

module.exports = thisHandler;

var POSSIBLE_GITHUB_TAGS = ["bug", "duplicate", "enhancement",  "question", "invalid", "wontfix"];

//////////////////////////////////////////////////////////////
// public

/*
 * Override of EventStrategyBase.Setup
 * SetupOptions are provided by a placeController.
 */
thisHandler.setup = function(setupOptions){

    var self = this;
    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var placeID = setupOptions.placeID;
    var placeUrl = setupOptions.placeUrl;
    var auth = self.gitHubFacade.createOauthObject( setupOptions.gitHubToken);
    
    return self.gitHubFacade.subscribeToRepoEvent(owner, repo, self.gitHubFacade.Events.Issues, auth, function (gitData) {
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
    var self = this;

    jive.logger.info("New Issue! Creating a discussion for it.");
    var builder = new self.jiveContentBuilder();
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
    var self = this;

    self.helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        return jiveApi.removeAnswer(discussion).then(function () {
            return jiveApi.unMarkFinal(discussion.contentID).then(function () {
                return jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
            });
        });
    });
}

function closeDiscussion(jiveApi, placeUrl, gitData) {
    var self = this;

    self.helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        return jiveApi.answer(discussion).then(function () {
            return jiveApi.markFinal(discussion.contentID).then(function () {
                return jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
            });
        });
    });
}

function updateDiscussionTags(jiveApi, placeUrl, gitData) {
    var self = this;

    self.helpers.getDiscussionForIssue(jiveApi, placeUrl, gitData.issue.id).then(function (discussion) {
        jiveApi.attachPropsToContent(discussion.contentID, createExtProps(gitData));
        var tags = editGitHubTags(discussion, gitData);
        var builder = new self.jiveContentBuilder(discussion);
        var content = builder.discussion()
            .tags(tags)
            .build();
        jiveApi.update(content).then(function (contentResponse) {
            jive.logger.debug(contentResponse);
        });
    });
}
