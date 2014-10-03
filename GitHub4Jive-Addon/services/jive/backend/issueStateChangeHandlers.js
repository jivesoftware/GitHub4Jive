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

var libDir = process.cwd() + "/lib/";
var gitFacade = require(libDir + "github4jive/gitHubFacade");
var helpers = require("./helpers");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// public

/*
 * use this function to change the state of an issue based on a structured outcome.
 * @param {string} placeUrl api url for the place that contains the discussion that was marked
 * @param {object} shallowDiscussion the lightweight object given in the Jive webhook payload. Should be a discussion
 * @return {promise}
 */
exports.changeIssueStateFromOutcome = function (placeUrl, shallowDiscussion) {
    return helpers.getPlace(placeUrl).then(function (linked) {
        return helpers.getJiveApi(linked).then(function (japi) {
            return helpers.hydrateObject(japi, shallowDiscussion).then(function (discussion) {
                return discussion.retrieveAllExtProps().then(function (discussionProps) {
                    return setGitHubIssueState(linked, japi, discussion.resources.self.ref, discussionProps,
                        discussion.outcomeCounts ? discussion.outcomeCounts.finalized : false);
                });
            });
        });
    });
};

/*
 * use this to change the state of an issue based on a discussion reply being marked as the answer
 * @param {string} placeUrl api url for the place that contains the discussion that was marked
 * @param {object} shallowMessage the lightweight object given in the Jive webhook payload. Should be a message
 * @return {promise}
 */
exports.changeIssueStateFromMarkedAnswer = function (placeUrl, shallowMessage) {
    return helpers.getPlace(placeUrl).then(function (linked) {
        return helpers.getJiveApi(linked).then(function (japi) {
            return helpers.hydrateObject(japi, shallowMessage).then(function (message) {
                var discussion = helpers.getDiscussionUrl(message);
                return japi.getAllExtProps(discussion).then(function (props) {
                    return setGitHubIssueState(linked, japi, discussion, props, !!message.answer);
                });
            });
        });
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// private helpers

function setGitHubIssueState(linked,japi,discussionUrl,props,shouldClose){
    props.github4jiveIssueClosed = props.github4jiveIssueClosed ? JSON.parse(props.github4jiveIssueClosed) : false;
    if(props.github4jiveIssueNumber && Boolean(shouldClose) !== Boolean(props.github4jiveIssueClosed)){
        var auth = gitFacade.createOauthObject(linked.github.token.access_token);
        props.github4jiveIssueClosed = shouldClose;
        var state = props.github4jiveIssueClosed ? "closed" : "open";
        return gitFacade.changeIssueState(linked.github.repoOwner, linked.github.repo,
                props.github4jiveIssueNumber, state, auth).then(function () {
                return japi.attachPropsToContent(discussionUrl, props);
            });
    }
}

