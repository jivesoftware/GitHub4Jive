var jive = require('jive-sdk');
var Q = require("q");
var https = require("https");
var url = require('url');

var JiveFacade = require("../../../common/JiveApiFacade");
var JiveOauth = require("../../../common/JiveOauth");
var StrategyBuilder = require("./StrategySetBuilder");
var placeStore = require("../../../common/PlaceStore");


var builder = new StrategyBuilder();
var stratSetScaffolding = builder.issues().issueComments();
var StrategySkeleton = require( "../../../common/strategies/EventStrategySkeleton");

function uniquePlace(lhs, rhs) {
    return lhs.placeUrl === rhs.placeUrl;
}

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

var strategyProvider = new StrategySkeleton(uniquePlace,linkedPlaceOptions,linkedPlaceOptions);

function updatePlace(linked){
    return strategyProvider.addOrUpdate(linked, stratSetScaffolding).then(function () {
        setupJiveHook(linked);
    })
};

exports.onBootstrap = function() {
    placeStore.getAllPlaces().then(function (places) {
        places.forEach(updatePlace);
    });
};

function setupJiveHook(linked){

    if(!linked.jive.hookID){
        var webhookCallback = jive.service.serviceURL() + '/webhooks?place='+ encodeURIComponent( linked.placeUrl);
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var community = community;

            function doWebhook(accessToken) {
                jive.webhooks.register(
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

                        return jive.webhooks.save(webhookToSave).then(function () {
                            return placeStore.save(linked.placeUrl, {jive:{hookID:webhookEntity.id}});
                        })
                    });
            }

            return doWebhook(linked.jive.access_token);
        })

    }else return Q(function () {
        return;
    });
}

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