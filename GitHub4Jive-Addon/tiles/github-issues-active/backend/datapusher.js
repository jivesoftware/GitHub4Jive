/*
 * Copyright 2013 Jive Software
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

var count = 0;

var jive = require("jive-sdk");
var gitHub = require("../../../common/GitHubFacade");
var tileFormatter = require("../../../common/TileFormatter");

var registeredTiles = {};

function addToRegisteredHash(id, repo, token, event){
    jive.logger.info("Successfully registered: " + repo + "-"+event+":"+token);
    if(!registeredTiles[id]){
        registeredTiles[id] = {};
    }
    registeredTiles[id][event] = token;
}

function setupIssueActivityFeed(instance, config, owner, repo, authOptions){
    jive.logger.info("Attempting to register " + config.repoFullName + " issue hook");
    return gitHub.subscribeToRepoEvent(owner, repo, gitHub.Events.Issues, authOptions,
        function (payload) {

            var whoDunIt = payload.sender.login;
            return gitHub.getUserDetails(whoDunIt,authOptions).then(function (user) {
                var title =  (user.name  || user.login) + " " + payload.action + " issue: " + payload.issue.title;
                var formattedData = tileFormatter.formatActivityData(
                    title, payload.issue.body, (user.name || user.login) , user.email, payload.issue.html_url);
                jive.extstreams.pushActivity(instance, formattedData);
            })

        }).then(function (subscriptionToken) {
            addToRegisteredHash(instance.id, config.repoFullName, subscriptionToken, gitHub.Events.Issues)
        })
}

function setupIssueCommentsActivityFeed(instance, config, owner, repo, authOptions){
    jive.logger.info("Attempting to register " + config.repoFullName + " issue comment hook");
    return gitHub.subscribeToRepoEvent(owner, repo, gitHub.Events.IssueComment, authOptions,
        function (payload) {

            var whoDunIt = payload.sender.login;
            return gitHub.getUserDetails(whoDunIt, authOptions).then(function (user) {
                var title = (user.name  || user.login) + " commented on issue: " + payload.issue.title;
                var formattedData = tileFormatter.formatActivityData(
                    title, payload.comment.body, user.name || user.login , user.email, payload.issue.html_url);
                jive.extstreams.pushActivity(instance, formattedData);
            })

        }).then(function (subscriptionToken) {
            addToRegisteredHash(instance.id, config.repoFullName, subscriptionToken, gitHub.Events.IssueComment)
        })
}

function setupGitHubListeners(instance){
    var config = instance.config;
    if ( !config || config['posting'] === 'off' || registeredTiles[instance.id]) {
        return;
    }



    oAuth.getOauthToken(ticketID).then(function (authOptions) {
        return setupIssueActivityFeed(instance, config, owner, repo, authOptions)
            .then(function () {
                return setupIssueCommentsActivityFeed(instance, config, owner, repo, authOptions)
            });
    }).catch(function (error) {
        jive.logger.error(error);
    });
}

exports.onBootstrap = function () {
    jive.extstreams.findByDefinitionName( 'github-issues-active').then(function (instances) {
        if(instances){
            instances.forEach(setupGitHubListeners)
        }

    });
};

exports.eventHandlers = [

    // process tile instance whenever a new one is registered with the service
    {
        'event' : jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : setupGitHubListeners
    },

    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : setupGitHubListeners
    }
];