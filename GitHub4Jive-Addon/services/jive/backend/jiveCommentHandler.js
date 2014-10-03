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
var q = require("q");
var githubCommonLibDir = process.cwd() + "/common/";
var gitFacade = require(githubCommonLibDir + "github4jive/gitHubFacade");
var helpers = require("./helpers");


function formatGitComment(japi, user, userPage, hookPayload) {
    return "<!--Jive-->\n"+ //placeHolder so that GitHubWebhook handler can tell if the comment originated from Jive
        "[[Jive](" + japi.community.jiveUrl + ") - [" + user.displayName +"](" + userPage + ")] " // On behalf of information
        + hookPayload.object.summary; //The comment text
}

/*
 * create a GitHub comment on the issue associated with the discussion in the webhook
 * @param {object} hookPayload entire Jive webhookPayload that contains a message that was marked as the answer
 * @return {promise}
 */
exports.createGitHubComment = function (hookPayload) {
    var place = hookPayload.target.id;
    var comment = hookPayload.object;//ARON RENAME THIS TO WHATEVER YOU WANT
    return helpers.getPlace(place).then(function (linked) {
        return helpers.getJiveApi(linked).then(function (japi) {
            return helpers.hydrateObject(japi, comment).then(function (message) {
                return message.retrieveAllExtProps().then(function (commentprops) {

                    if (commentprops.fromGitHub) {//Check for a comment originally from GitHub
                        return q();
                    }

                    //then check if the comment was even on a linked discussion
                    var discussion = helpers.getDiscussionUrl(message);
                    return japi.getAllExtProps(discussion).then(function (props) {
                        var issueNumber = props.github4jiveIssueNumber;
                        if (!issueNumber) {//Discussion is not linked to an issue so we can throw this payload out
                            return q();
                        }

                        //finally, create the comment on GitHub with relevant user data
                        return japi.get(hookPayload.object.author.id).then(function (user) {
                            user = user.entity;
                            var userPage = user.resources.html.ref;
                            var gitComment = formatGitComment(japi, user, userPage, hookPayload);
                            var auth = gitFacade.createOauthObject(linked.github.token.access_token);
                            return gitFacade.addNewComment(linked.github.repoOwner, linked.github.repo,
                                issueNumber, gitComment, auth).then(function (response) {
                            })
                        });
                    });
                });
            });
        });
    });
};
