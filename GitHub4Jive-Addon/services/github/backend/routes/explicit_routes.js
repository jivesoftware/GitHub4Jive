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