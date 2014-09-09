var jive = require('jive-sdk');
var fs = require('fs');
var gitHubController = require("../GitHubController");
var config = require("../../../../jiveclientconfiguration.json");

/*
 * This endpoint is required for the GitHubFacade to deliver GitHub payloads
 * to registered event handlers.
 */
exports.GitHubWebHookPortal = {
    'path': config.github.webHookUrl,
    'verb': 'post',
    'route': gitHubController.gitHubWebHookPortal
};

/*
 * This endpoint is used extensively for configuration. This allows a user to get
 * the list of possible repositories that can be accessed by the GitHub4Jive system.
 */
exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/github/user/repos',
    'route' : gitHubController.getUserRepos
};

/*
 * Retrieve all issues for the repository currently linked to a place
 */
exports.IssuesForPlace = {
    'verb' : 'get',
    'path' : '/github/place/issues',
    'route' : gitHubController.getPlaceIssues
};

exports.newIssue = {
    'verb' : 'post',
    'path' : '/github/place/newIssue',
    'route' : gitHubController.newIssue
};

exports.changeIssueState = {
    'verb' : 'post',
    'path' : '/github/place/changeIssueState',
    'route' : gitHubController.changeIssueState
};

exports.changeIssueLabels = {
    'verb' : 'post',
    'path' : '/github/place/changeIssueLabels',
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
    'route' : gitHubController.newComment
};