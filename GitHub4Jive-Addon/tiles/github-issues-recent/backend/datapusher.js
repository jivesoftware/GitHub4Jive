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
var q = require("q");


var JiveApi = require("github4jive/JiveApiFacade");
var JiveOAuth = require("github4jive/JiveOauth");
var JiveDecorator = require("github4jive/jiveDecorators");
var StrategyBuilder = require("./StrategySetBuilder");
var StrategySkeleton = require("github4jive/strategies/EventStrategySkeleton");

var placeStore = require("github4jive/placeStore");
var gitFacade = require("github4jive/gitHubFacade");
var tileFormatter = require("github4jive/tileFormatter");

var builder = new StrategyBuilder();
var stratSetScaffolding = builder.issues();


// constants////////////////////////////
var colorMap = {
    'green':'https://cdn1.iconfinder.com/data/icons/function_icon_set/circle_green.png',
    'red':'https://cdn1.iconfinder.com/data/icons/function_icon_set/circle_red.png',
    'disabled':'https://cdn1.iconfinder.com/data/icons/function_icon_set/warning_48.png'
};

var GITHUB_RECENT_ISSUES_TILE_NAME = "github-issues-recent";
////////////////////////////////////////

function decorateIssuesWithColoredIcons(issues){
    issues.forEach(function(issue){
        var labels = issue.labels.map(function(label){return label.name;});
        var icon = labels.indexOf("bug") >= 0 ? colorMap["red"] : colorMap["green"];
        issue["icon"] = icon;
    });
    return issues;
}

function decorateIssuesWithActions(issues, repository){
    issues.forEach(function(issue){
        issue["action"] = {
            url : jive.service.options['clientUrl'] + '/github-issues-recent_GitHubIssues-List/action?id='+ new Date().getTime(),
            context : {url:issue.html_url,title:issue.title,number:issue.number,repo:repository, labels:issue.labels, discussionLink: issue.jiveContentLink  }
        };
    });
    return issues;
}

function decorateIssuesWithJiveContentLinks(jiveApi, place, issues){
    return q.all(issues.map(function (issue) {
        return JiveDecorator.decorateIssueWithJiveContent(jiveApi, place, issue);
    }));
}

function processTileIssues(instance, linked, issues){
    var fullName = linked.github.repoOwner + "/" + linked.github.repo;
    if (issues.length == 0) {
        jive.tiles.pushData(instance,
            {data: tileFormatter.emptyListData(fullName, "No open issues")});
    }
    else {
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var place = instance.config.parent;
            var jiveAuth = new JiveOAuth(place, linked.jive.access_token, linked.jive.refresh_token);
            var jiveApi = new JiveApi(community, jiveAuth);

            return decorateIssuesWithJiveContentLinks(jiveApi, place, issues).then(function (issues) {
                var decoratedIssues = decorateIssuesWithColoredIcons(issues);

                decoratedIssues = decorateIssuesWithActions(decoratedIssues, fullName);
                var formattedIssues = tileFormatter.formatListData(fullName, decoratedIssues,
                    {"text": "title"});
                jive.tiles.pushData(instance, {data: formattedIssues});

            });

        });
    }
}

/**
 * This function is referenced in IssueStrategy through the setupOptions provided by SetupInstance function.
 * The strategy uses it to update the tile on any change to an issue.
 * @param {object} instance of a tile
 */
function processTileInstance(instance) {
    if ( instance.name === GITHUB_RECENT_ISSUES_TILE_NAME ) {
        var place = instance.config.parent;
        return placeStore.getPlaceByUrl(place).then(function (linked) {
            var auth = gitFacade.createOauthObject(linked.github.token.access_token);
            return gitFacade.getRepositoryIssues(linked.github.repoOwner, linked.github.repo, auth, 10, "open")
                .then(function (issues) {
                    processTileIssues(instance, linked, issues);
                });
        });
    }
}

var pushData = function () {
    jive.tiles.findByDefinitionName( GITHUB_RECENT_ISSUES_TILE_NAME ).then( function(tiles) {
        return q.all(tiles.map(processTileInstance)) ;
    });
};

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
        var setupOptions = {
            owner: linked.github.repoOwner,
            repo: linked.github.repo,
            gitHubToken: linked.github.token.access_token,
            placeUrl: linked.placeUrl,
            instance: instance,
            processTile: processTileInstance
        };
        return setupOptions;
    });
};

/**
 * used by EventStrategySkeleton
 */
var tearDownInstance = function (instance) {
    var place = instance.config.parent;
    return placeStore.getPlaceByUrl(place).then(function (linked) {
        var setupOptions = {
            placeUrl: linked.placeUrl,
            gitHubToken: linked.github.token.access_token
        };
        return setupOptions;
    });
};

/**
 * Handles event handlers registration and un registration
 */
var strategyProvider = new StrategySkeleton(uniqueTile,setupInstance,tearDownInstance);

var updateTileInstance = function (newTile) {
    if ( newTile.name === GITHUB_RECENT_ISSUES_TILE_NAME ) {
        strategyProvider.addOrUpdate(newTile, stratSetScaffolding).then(function () {
            return processTileInstance(newTile);
        });
    }
};

var setupAll = function(){
    jive.tiles.findByDefinitionName( GITHUB_RECENT_ISSUES_TILE_NAME ).then( function(tiles) {
        return q.all(tiles.map(updateTileInstance));
    });
};

exports.onBootstrap = setupAll;


exports.task = [
    {
        'interval' : 60000,
        'handler' : pushData
    }
];


exports.eventHandlers = [

    {
        'event': 'activityUpdateInstance',
        'handler' : processTileInstance
    },
    {
        'event': jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : updateTileInstance
    },
    {
        'event': jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : updateTileInstance
    }
];
