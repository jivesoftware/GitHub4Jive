var jive = require('jive-sdk');
var fs = require('fs');

var gitHubController = require("../gitHubController");
var config = jive.context.config;
var service = require('./../gitHubOAuthController.js');

/**
 * This endpoint is required for the GitHubFacade to deliver GitHub payloads
 * to registered event handlers.
 */
exports.GitHubWebHookPortal = {
    'path': config.github.webHookUrl,
    'verb': 'post',
    'route': gitHubController.gitHubWebHookPortal
};

/**
 * This endpoint is used extensively for configuration. This allows a user to get
 * the list of possible repositories that can be accessed by the GitHub4Jive system.
 */
exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/github/user/repos',
    'jiveLocked' : true,
    'route' : gitHubController.getUserRepos
};

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

/**
 * These are required routes to handle the basicOauthFlow.js process.
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