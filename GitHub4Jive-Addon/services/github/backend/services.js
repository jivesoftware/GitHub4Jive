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

function linkedPlaceSkeleton(linked, action){
    var place = linked.placeID;
    var jiveToken = linked.jive.access_token;
    var jiveRefresh = linked.jive.refresh_token;
    var gitHubToken = linked.github.token.access_token;
    var jiveUrl = linked.jiveUrl;
    var repo = linked.github.repo;
    var repoOwner = linked.github.repoOwner;
    var jiveAuth = new JiveOauth(jiveToken, jiveRefresh, function (newTokens, community) {
        jive.logger.info("Refreshing Jive tokens for: "+ linked.placeUrl);
        jiveAuth = new JiveOauth(newTokens.access_token, newTokens.refresh_token, this)
        return placeStore.save(linked.placeUrl,{jive:newTokens});
    });


    return jive.community.findByJiveURL(jiveUrl).then(function (community) {
        var japi = new JiveFacade(community, jiveAuth);
        if (!repo || !repoOwner) {
            jive.logger.error("Missing repo information for " + linked.placeUrl)

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
            return action(setupOptions);
        }
    });
}

function decorateLinkedPlaceWithStategies(linked) {
    linked.setupStrategies = stratSetScaffolding.build();
}

function setUpLinkedPlace(linked){
    decorateLinkedPlaceWithStategies(linked);
    return linkedPlaceSkeleton(linked, linked.setupStrategies.setup);
}

function teardownLinkedPlace(linked) {
    return linkedPlaceSkeleton(linked, linked.setupStrategies.teardown);
}

var linkedPlaces = [];

exports.onBootstrap = function() {
    placeStore.getAllPlaces().then(function (places) {
        linkedPlaces = places;
        linkedPlaces.forEach(setUpLinkedPlace);
    });
};

function setupJiveHook(linked){

    if(!linked.jive.hookID){
        var webhookCallback = jive.service.serviceURL() + '/webhooks?place='+ encodeURIComponent( linked.placeUrl);
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var community = community;

            function doWebhook(accessToken) {
                jive.webhooks.register(
                    community, undefined, linked.placeUrl,
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

    placeStore.invalidateCache(placeUrl).then(function (newLinkedPlace) {
        var tempCollection = [];
        var toTeardown;
        linkedPlaces.forEach(function (place) {
            if(place.placeUrl !== newLinkedPlace.placeUrl){
                tempCollection.push(place);
            }else{//found it
                toTeardown = place;
            }
        });
        tempCollection.push(newLinkedPlace);
        linkedPlaces = tempCollection;
        return setupJiveHook(newLinkedPlace).then(function () {
            if(toTeardown) {
                return teardownLinkedPlace(toTeardown).then(function () {
                    setUpLinkedPlace(newLinkedPlace);
                });
            }else{
                return setUpLinkedPlace(newLinkedPlace);
            }
        });


    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({success:false}));
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({success:true}));
};