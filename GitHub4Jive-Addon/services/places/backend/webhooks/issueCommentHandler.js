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

thisHandler.name = "Place_IssueComments";
module.exports = thisHandler;

/*
 * This handler modifies anything in a place that is not on a tile in response to a created issue comment.
 */
thisHandler.setup = function(setupOptions) {
    var self = this;
    var jiveApi = setupOptions.jiveApi;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var auth = self.gitHubFacade.createOauthObject( setupOptions.gitHubToken);

    return self.gitHubFacade.subscribeToRepoEvent(owner, repo, self.gitHubFacade.Events.IssueComment, auth, function (gitData) {
        //GitHub comment event handler
        var gitComment = gitData.comment.body;
      
        if(commentDidNotOriginateFromJive.call( self, gitComment)){
            self.helpers.getDiscussionForIssue(jiveApi,setupOptions.placeUrl, gitData.issue.id)
                .then(function (discussion) {
                    addCommentToDiscussion.call(self, jiveApi, gitData, auth, discussion);
                })
                .catch(function (error) {
                    jive.logger.error(error);
                });
        }
    });
};

function commentDidNotOriginateFromJive(gitComment) {
    return gitComment.indexOf("<!--Jive-->") != 0;
}

function formatGitComment(gitComment) {
    gitComment = "<!--GitHub-->" + gitComment;
}

function addCommentToDiscussion(jiveApi, gitData, gitAuth, discussion){
    var self = this;

    if(discussion){
        return self.gitHubFacade.getUserDetails(gitData.comment.user.login, gitAuth).then(function (user) {
            var builder = new self.jiveContentBuilder();
            var gitComment = gitData.comment.body;
            formatGitComment(gitComment);
            var jiveReply = builder.message()
                .body(gitComment)
                .onBehalfOf(user.email || "", user.login)
                .build();
            return jiveApi.replyToDiscussion(discussion.contentID , jiveReply).then(function (response) {
                if (!response.success) {
                    jive.logger.error("Error creating comment on " + discussion.subject, response);
                }else{
                    jiveApi.attachPropsToReply(response.entity.id,{fromGitHub: true}).then(function (response) {
                        if (!response.success) {
                            jive.logger.error("Error attaching props to comment", response);
                        }
                    })
                }
            })
        });

    }
}

