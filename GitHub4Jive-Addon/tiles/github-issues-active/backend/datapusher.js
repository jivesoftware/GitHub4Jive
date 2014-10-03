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

var JiveApi = require(libDir + "github4jive/JiveApiFacade");
var JiveOAuth = require(libDir + "github4jive/JiveOauth");
var placeStore = require(libDir + "github4jive/placeStore");
var StrategySetBuilder = require("./StrategySetBuilder");
var StrategySkeleton = require(libDir + "github4jive/strategies/EventStrategySkeleton");

var stratSetScaffolding = new StrategySetBuilder().issues();

/**
 * used by EventStrategySkeleton
 */
function uniqueTile(lhs, rhs){
    return lhs.config.parent === rhs.config.parent;
}

/**
 * used by EventStrategySkeleton
 */
var setupInstance = function(instance){
    var place = instance.config.parent;
    return placeStore.getPlaceByUrl(place).then(function (linked) {
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var jiveAuth = new JiveOAuth(place, linked.jive.access_token, linked.jive.refresh_token);
            var setupOptions = {
                owner: linked.github.repoOwner,
                repo: linked.github.repo,
                jiveApi: new JiveApi(community,jiveAuth),
                gitHubToken: linked.github.token.access_token,
                placeUrl: linked.placeUrl,
                instance: instance
            };
            return setupOptions;
        });
    });
};

/**
 * Handles event handlers registration and un registration
 */
var strategyProvider = new StrategySkeleton(uniqueTile,setupInstance,setupInstance);

var updateTileInstance = function (newTile) {
    if ( newTile.name === GITHUB_ISSUES_ACTIVITY_TILE ) {
        strategyProvider.addOrUpdate(newTile, stratSetScaffolding);
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