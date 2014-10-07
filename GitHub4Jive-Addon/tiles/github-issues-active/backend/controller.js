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

var GITHUB_ISSUES_ACTIVITY_TILE = 'github-issues-active';

var jive = require("jive-sdk");
var libDir = process.cwd() + "/lib/";
var gitHubWebhooksProcessor = require("./webhooks/webhookProcessor");

/**
 * Handles event handlers registration and un registration
 */

var updateTileInstance = function (newTile) {
    if ( newTile.name === GITHUB_ISSUES_ACTIVITY_TILE ) {
        gitHubWebhooksProcessor.setup(newTile);
    }
};

exports.onBootstrap = function () {
    jive.extstreams.findByDefinitionName( GITHUB_ISSUES_ACTIVITY_TILE).then(function (instances) {
        if(instances){
            instances.forEach(updateTileInstance)
        }
    });
};

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