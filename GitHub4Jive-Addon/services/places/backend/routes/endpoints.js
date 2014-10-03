var jive = require('jive-sdk');
var fs = require('fs');
var placeController = require("./placeController");

exports.placeCurrentConfig = {
    'verb' : 'get',
    'path' : '/github4jive/place/isConfigured',
    'jiveLocked' : true,
    'route' : placeController.placeCurrentConfig
};

exports.basicTileConfig = {
    'verb' : 'get',
    'path' : '/github4jive/basicTileConfig',
    'route' : placeController.basicTileConfig
};

/*
 * This endpoint triggers the controller to update the specified place. Call it
 * when a place changes its repository.
 */
exports.ConfigurationUpdateTrigger = {
    'verb': 'post',
    'path': "/github4jive/place/trigger",
    'jiveLocked' : true,
    'route': placeController.onConfigurationChange
};
