var jive = require('jive-sdk');
var fs = require('fs');
var jiveController = require("../jiveController")

exports.webhookPortal = {
    'verb' : 'post',
    'path' : '/webhooks',
    'jiveLocked' : true,
    'route' : jiveController.webHookPortal
}