var jive = require('jive-sdk');
var fs = require('fs');
var gitHubController = require("../../../../common/GitHubController");
var config = require("../../../../jiveclientconfiguration.json");
var service = require("../services");

exports.GitHubWebHookPortal = {
    'path': config.github.webHookUrl,
    'verb': 'post',
    'route': gitHubController.gitHubWebHookPortal
};

exports.ConfigurationUpdateTrigger = {
    'path': "/github/place/trigger",
    'verb': 'post',
    'route': service.onConfigurationChange
};

exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/github/user/repos',
    'route' : gitHubController.getUserRepos
}

exports.commentsForIssue = {
    'verb' : 'get',
    'path' : '/github/place/comments',
    'route' : gitHubController.getIssueComments
}

exports.closeIssue = {
    'verb' : 'post',
    'path' : '/github/place/changeIssueState',
    'route' : gitHubController.changeIssueState
}

exports.newComment = {
    'verb' : 'post',
    'path' : '/github/place/newComment',
    'route' : gitHubController.newComment
}