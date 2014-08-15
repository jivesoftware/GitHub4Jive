var service = require('./service_impl.js');
var gitHubController = require("../../../../../common/GitHubController");

exports.authorizeUrl = {
    'path' : '/github/oauth/authorize',
    'verb' : 'get',
    'route': service.authorizeUrl.bind(service)
};

exports.oauth2Callback = {
    'path' : '/github/oauth/callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};

exports.repositoryListForUser = {
    'verb' : 'get',
    'path' : '/github/user/repos',
    'route' : gitHubController.getUserRepos
};

exports.IssuesForPlace = {
    'verb' : 'get',
    'path' : '/github/place/issues',
    'route' : gitHubController.getPlaceIssues
};