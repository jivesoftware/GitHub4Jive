var jive = require('jive-sdk');
var fs = require('fs');
var jiveController = require("../jiveController")

exports.webhookPortal = {
    'verb' : 'post',
    'path' : '/webhooks',
    'route' : jiveController.webHookPortal
}