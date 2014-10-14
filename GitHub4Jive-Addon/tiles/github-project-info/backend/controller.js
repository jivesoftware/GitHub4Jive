/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var jive = require("jive-sdk");
var q = require('q');

var libDir = process.cwd() + "/lib/";
var placeStore = require(libDir + "github4jive/placeStore");
var tileInstanceProcessor = require("./tileInstanceProcessor");
var gitHubWebhooks = require("./webhooks/webhookProcessor");

var GITHUB_PROJECT_INFO_TILE = 'github-project-info';

/**
 * Iterates through the tile instances registered in the service, and pushes an update to it
 */
var pushData = function() {
    var deferred = q.defer();
    jive.tiles.findByDefinitionName(GITHUB_PROJECT_INFO_TILE).then(function(instances) {
        if (instances) {
            q.all(instances.map(tileInstanceProcessor.processTileInstance)).then(function() {
                deferred.resolve(); //success
            }, function() {
                deferred.reject(); //failure
            });
        } else {
            jive.logger.debug("No jive instances to push to");
            deferred.resolve();
        }
    });
    return deferred.promise;
};

var updateTileInstance = function (newTile) {
    if ( newTile.name === GITHUB_PROJECT_INFO_TILE ) {
        gitHubWebhooks.setup(newTile).then(function () {
            return tileInstanceProcessor.processTileInstance(newTile);
        });
    }
};

exports.onBootstrap = function(){
    jive.tiles.findByDefinitionName( GITHUB_PROJECT_INFO_TILE ).then( function(tiles) {
        return q.all(tiles.map(updateTileInstance));
    });
};

// /**
//  * Schedules the tile update task to automatically fire every 10 seconds
//  */
// exports.task = [
//     {
//         'interval' : 600000,//ten minutes
//         'handler' : pushData
//     }
// ];

/**
 * Defines event handlers for the tile life cycle events
 */
exports.eventHandlers = [

    // process tile instance whenever a new one is registered with the service
    {
        'event' : jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : updateTileInstance
    },

    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : updateTileInstance
    }
];


