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

var https = require("https");
var url = require('url');
var jive = require("jive-sdk");
var q = require("q");

var githubCommonLibDir = process.cwd() + "/common/";
var JiveFacade = require(githubCommonLibDir + "github4jive/JiveApiFacade");
var JiveOauth = require(githubCommonLibDir + "github4jive/JiveOauth");
var StrategyBuilder = require("./StrategySetBuilder");
var StrategySkeleton = require(githubCommonLibDir + "github4jive/strategies/EventStrategySkeleton");

var placeStore = require(githubCommonLibDir + "github4jive/placeStore");
var builder = new StrategyBuilder();
var stratSetScaffolding = builder.issues().issueComments();


/*
 * Given a place api url this endpoint returns an object describing which services have been configured.
 * @param {string} place this is a url encoded string that determines which place to get configuration status for
 * @return {object} object with github and jive boolean members.
 */
exports.placeCurrentConfig = function (req, res) {
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    if(!placeUrl || placeUrl === ""){
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify("Specify place api url"));
    }
    placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        var clientSideConfig = {github: false, jive: false};
        try{
            if(linked.github.token.access_token){
                clientSideConfig.github = true;
            }
        }catch(e){

        }
        try{
            if(linked.jive.access_token){
                clientSideConfig.jive = true;
            }
        }catch(e){

        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clientSideConfig));
    }).catch(function (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    })
};

/*
 * This returns the configuration page for a tile that requires no extra configuration to run.
 * Ex. Recent Issues Tile and Project Info Tile
 */
exports.basicTileConfig = function (req, res) {
    res.render('../../../public/configuration.html', { host: jive.service.serviceURL()  });
};

/*
 * used in EventStrategySkeleton
 */
function uniquePlace(lhs, rhs) {
    return lhs.placeUrl === rhs.placeUrl;
}

/*
 * used in EventStrategySkeleton
 */
function linkedPlaceOptions(linked){
    var place = linked.placeID;
    var gitHubToken = linked.github.token.access_token;
    var jiveUrl = linked.jiveUrl;
    var repo = linked.github.repo;
    var repoOwner = linked.github.repoOwner;
    var jiveAuth = new JiveOauth(linked.placeUrl,linked.jive.access_token, linked.jive.refresh_token);

    return jive.community.findByJiveURL(jiveUrl).then(function (community) {
        var japi = new JiveFacade(community, jiveAuth);
        if (!repo || !repoOwner) {
            jive.logger.error("Missing repo information for " + linked.placeUrl)
            return {};
        }
        else {
            var setupOptions = {
                jiveApi: japi,
                placeID: place,
                owner: repoOwner,
                repo: repo,
                gitHubToken: gitHubToken,
                placeUrl: linked.placeUrl
            };
            return (setupOptions);
        }
    });
}

function setupJiveHook(linked){

    if(!linked.jive.hookID){
        var webhookCallback = jive.service.serviceURL() + '/webhooks?place='+ encodeURIComponent( linked.placeUrl);
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var community = community;

            //register Webhook on Jive Instance
            var accessToken = linked.jive.access_token;

            return jive.webhooks.register(
                community, "discussion", linked.placeUrl,
                webhookCallback, accessToken
            ).then(function (webhook) {
                    var webhookEntity = webhook['entity'];
                    var webhookToSave = {
                        'object': webhookEntity['object'],
                        'events': webhookEntity['event'],
                        'callback': webhookEntity['callback'],
                        'url': webhookEntity['resources']['self']['ref'],
                        'id': webhookEntity['id']
                    };

                    //save webhook in service and placeStore to unregister later.
                    return jive.webhooks.save(webhookToSave).then(function () {
                        return placeStore.save(linked.placeUrl, {jive:{hookID:webhookEntity.id}});
                    })
                });
        })

    }else return q();
}

var strategyProvider = new StrategySkeleton(uniquePlace,linkedPlaceOptions,linkedPlaceOptions);

function updatePlace(linked){
    return strategyProvider.addOrUpdate(linked, stratSetScaffolding).then(function () {
        setupJiveHook(linked);
    });
}

/*
 * Start all event handlers for all places when the service starts
 */
exports.onBootstrap = function() {
    placeStore.getAllPlaces().then(function (places) {
        places.forEach(updatePlace);
    });
};

/*
 * this is called when the trigger route is hit. It tells the service to update the runtime configuration
 * of a given place by tearing down old event handlers if they exist and creating new ones.
 * @param {string} place place api url
 * @return {object} object with success member to determine a successful update on the ui.
 */
exports.onConfigurationChange = function(req, res){
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    placeStore.invalidateCache(placeUrl).then(updatePlace).then(function () {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({success:true}));
    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({success:false}));
    });

};