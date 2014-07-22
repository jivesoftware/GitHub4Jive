var oAuth = require('../../../../../common/OauthProvider.js');
var gitHubController = require("../../../../../common/GitHubController");

exports.authorizeUrl = {
    'verb' : 'get',
    'path' : '/example-github/oauth/authorizeUrl',
    'route': oAuth.authorizeUrl.bind(oAuth)
};

exports.oauth2Callback = {
    'verb' : 'get',
    'path' : '/example-github/oauth/oauth2Callback',
    'route': oAuth.oauth2Callback.bind(oAuth)
};

exports.isAuthenticated = {
    'path' : '/example-github/oauth/isAuthenticated',
    'verb' : 'get',
    'route' : gitHubController.isAuthenticated
};

exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/example-github/user/repos',
    'route' : gitHubController.getUserRepos
}

exports.commentsForIssue = {
    'verb' : 'get',
    'path' : '/example-github/comments',
    'route' : gitHubController.getIssueComments
}

exports.closeIssue = {
    'verb' : 'post',
    'path' : '/example-github/changeIssueState',
    'route' : gitHubController.changeIssueState
}

exports.newComment = {
    'verb' : 'post',
    'path' : '/example-github/newComment',
    'route' : gitHubController.newComment
}