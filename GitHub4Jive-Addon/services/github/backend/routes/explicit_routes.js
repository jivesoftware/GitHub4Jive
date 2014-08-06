var jive = require('jive-sdk');
var fs = require('fs');
var gitHubController = require("../../../../common/GitHubController");
var config = require("../../../../jiveclientconfiguration.json");


exports.GitHubWebHookPortal = {
    'path': config.gitHubWebHookUrl,
    'verb': 'post',
    'route': gitHubController.gitHubWebHookPortal
};