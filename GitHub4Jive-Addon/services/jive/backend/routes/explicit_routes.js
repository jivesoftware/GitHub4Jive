var jive = require('jive-sdk');
var fs = require('fs');
var jiveController = require("./JiveController")

exports.placeCurrentConfig = {
    'verb' : 'get',
    'path' : '/jive/place/isConfigured',
    'route' : jiveController.placeCurrentConfig
};

exports.basicTileConfig = {
    'verb' : 'get',
    'path' : '/github4jive/basicTileConfig',
    'route' : jiveController.basicTileConfig
};

exports.webhookPortal = {
    'verb' : 'post',
    'path' : '/webhooks',
    'route' : jiveController.webHookPortal
}