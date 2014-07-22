/*
 * Copyright 2014 Jive Software
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

var count = 0;
var jive = require("jive-sdk");

var gitHubFacade = require("../../../common/GitHubFacade")
var sampleOauth = require('./routes/oauth/sampleOauth');
var tileFormatter = require("../../../common/TileFormatter");

var colorMap = {
    'green':'http://cdn1.iconfinder.com/data/icons/function_icon_set/circle_green.png',
    'red':'http://cdn1.iconfinder.com/data/icons/function_icon_set/circle_red.png',
    'disabled':'http://cdn1.iconfinder.com/data/icons/function_icon_set/warning_48.png'
};

var GITHUB_RECENT_ISSUES_TILE_NAME = "github-issues-recent";

function decorateIssuesWithColoredIcons(issues){
    issues.forEach(function(issue){
        var labels = issue.labels.map(function(label){return label.name;});
        var icon = labels.indexOf("bug") >= 0 ? colorMap["red"] : colorMap["green"];
        issue["icon"] = icon;
    });
    return issues;
}

function pushUpdate(tile) {
    var config = tile.config;
    console.log('pushing update: '+ tile.name +','+ config.repoOwner + "/" + config.repoName +", " + tile.jiveCommunity);

    sampleOauth.getOauthToken(config.ticketID).then(function(authOptions){
        return gitHubFacade.getRepositoryIssues(config.repoOwner, config.repoName, authOptions, 10);
    }).then(function(issues){
        var decoratedIssues = decorateIssuesWithColoredIcons( issues);
        var formattedIssues = tileFormatter.formatListData(config.repoFullName,decoratedIssues, {"text" : "title"});
        jive.tiles.pushData(tile, {data: formattedIssues});
    })
}

exports.task = new jive.tasks.build(
    // runnable
    function() {
        jive.tiles.findByDefinitionName( GITHUB_RECENT_ISSUES_TILE_NAME ).then( function(tiles) {
            tiles.forEach(pushUpdate) ;
        });
    },

    // interval (optional)
    10000
);

exports.eventHandlers = [

    {
        'event': 'activityUpdateInstance',
        'handler' : function(theInstance){
            jive.logger.info("Caught activityUpdateInstance event, trying to push now.");
            if ( theInstance['name'] == GITHUB_RECENT_ISSUES_TILE_NAME ) {
                pushUpdate(theInstance);
            }
        }
    },
    {
        'event': jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : function(theInstance){
            jive.logger.info("Caught activityUpdateInstance event, trying to push now.");
            if ( theInstance['name'] == GITHUB_RECENT_ISSUES_TILE_NAME ) {
                pushUpdate(theInstance);
            }
        }
    },
    {
        'event': jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : function(theInstance){
            jive.logger.info("Caught activityUpdateInstance event, trying to push now.");
            if ( theInstance['name'] == GITHUB_RECENT_ISSUES_TILE_NAME ) {
                pushUpdate(theInstance);
            }
        }
    }
];
