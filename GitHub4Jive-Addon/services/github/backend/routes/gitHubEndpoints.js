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

var jive = require('jive-sdk');
var fs = require('fs');

var config = jive.context.config;
var gitHubController = require("./../gitHubController");
var service = require('./../gitHubOAuthController.js');

/**
 * GitHub calls this endpoint when it wants to notify the service of
 * events that the service has registered for.
 */
exports.GitHubWebHookPortal = {
    'path': config.github.webHookUrl, // typically is /github/WebHookPortal
    'verb': 'post',
    'route': gitHubController.gitHubWebHookPortal
};

/**
 * This endpoint is used by place configuration UIs. This allows a user to get
 * the list of possible repositories that can be accessed by the GitHub4Jive system.
 */
exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/github/user/repos',
    'jiveLocked' : true,
    'route' : gitHubController.getUserRepos
};


////////////////////////////////////////////////////////////////////////////////////////////
// the following endpoints are used for proxying to GitHub.

/**
 * Retrieve all issues for the repository currently linked to a place
 */
exports.IssuesForPlace = {
    'verb' : 'get',
    'path' : '/github/place/issues',
    'jiveLocked' : true,
    'route' : gitHubController.getPlaceIssues
};

exports.newIssue = {
    'verb' : 'post',
    'path' : '/github/place/newIssue',
    'jiveLocked' : true,
    'route' : gitHubController.newIssue
};

exports.changeIssueState = {
    'verb' : 'post',
    'path' : '/github/place/changeIssueState',
    'jiveLocked' : true,
    'route' : gitHubController.changeIssueState
};

exports.changeIssueLabels = {
    'verb' : 'post',
    'path' : '/github/place/changeIssueLabels',
    'jiveLocked' : true,
    'route' : gitHubController.changeIssueLabels
};

exports.commentsForIssue = {
    'verb' : 'get',
    'path' : '/github/place/comments',
    'route' : gitHubController.getIssueComments
};

exports.newComment = {
    'verb' : 'post',
    'path' : '/github/place/newComment',
    'jiveLocked' : true,
    'route' : gitHubController.newComment
};


////////////////////////////////////////////////////////////////////////////////////////////
// the following endpoints are used for acquiring an user access token for making calls
// to GitHub. They are invoked during the course of exercising the place configuration UI.

/**
 * These are required routes to handle the configurePlace.js process.
 */

exports.authorizeUrl = {
    'path' : '/github/oauth/authorize',
    'verb' : 'get',
    'jiveLocked' : true,
    'route': service.authorizeUrl.bind(service)
};

/**
 * This callback is called after GitHub has received the authorization from the user.
 * The oauth token is stored here.
 */

exports.oauth2Callback = {
    'path' : '/github/oauth/callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};