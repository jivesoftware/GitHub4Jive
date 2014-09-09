var jive = require('jive-sdk');
var fs = require('fs');
var jiveController = require("../JiveController")

exports.webhookPortal = {
    'verb' : 'post',
    'path' : '/webhooks',
    'route' : jiveController.webHookPortal
}