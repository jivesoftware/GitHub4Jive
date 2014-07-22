var sampleOauth = require('./sampleOauth.js');
var gitHubQueryer = require('./githubQueryer.js');

var gitHubEndPoint = require("../../GitHubController");

exports.authorizeUrl = {
    'verb' : 'get',
    'path' : '/example-github/oauth/authorizeUrl',
    'route': sampleOauth.authorizeUrl.bind(sampleOauth)
};

exports.oauth2Callback = {
    'verb' : 'get',
    'path' : '/example-github/oauth/oauth2Callback',
    'route': sampleOauth.oauth2Callback.bind(sampleOauth)
};

exports.query = {
    'verb' : 'get',
    'path' : '/example-github/oauth/query',
    'route' : gitHubQueryer.handleGitHubQuery
};

exports.post = {
    'verb' : 'post',
    'path' : '/example-github/oauth/post',
    'route' : gitHubQueryer.handleGitHubPost
};

exports.isAuthenticated = {
    'path' : '/example-github/oauth/isAuthenticated',
    'verb' : 'get',
    'route' : gitHubQueryer.isAuthenticated
};

exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/example-github/user/repos',
    'route' : gitHubEndPoint.getUserRepos
}
