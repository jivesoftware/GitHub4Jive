var jive = require('jive-sdk');
var Q = require("q");
var https = require("https");
var url = require('url');

var JiveFacade = require("../../../common/JiveApiFacade");
var JiveOauth = require("../../../common/JiveOauth");
var StrategyBuilder = require("./StrategySetBuilder");
var placeStore = require("../../../common/PlaceStore");

//This can be moved into functions below if we need to dynamically configure events.
// They will need to be saved into the linkedPlaces array for teardown. Everyone gets the same for now though.
var builder = new StrategyBuilder();
var stratSet = builder.issues().issueComments().build();

function linkedPlaceSkeleton(linked, action){
    var place = linked.placeID;
    var jiveToken = linked.jive.access_token;
    var jiveRefresh = linked.jive.refresh_token;
    var gitHubToken = linked.github.token.access_token;
    var jiveUrl = linked.jiveUrl;
    var repo = linked.github.repo;
    var repoOwner = linked.github.repoOwner;
    var jiveAuth = new JiveOauth(jiveToken, jiveRefresh, function (newTokens, community) {
        jive.logger.debug(newTokens);
    });

    if(!repo || !repoOwner){
        jive.logger.error("Missing repo information for "+ linked.placeUrl)
    }else{
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

}

function setUpLinkedPlace(linked){
    return linkedPlaceSkeleton(linked, stratSet.setup);
}

function teardownLinkedPlace(linked) {
    return linkedPlaceSkeleton(linked, stratSet.teardown);
}

var linkedPlaces;

exports.onBootstrap = function() {
    placeStore.getAllPlaces().then(function (places) {
        linkedPlaces = places;
        linkedPlaces.forEach(setUpLinkedPlace);
    });
};

exports.onConfigurationChange = function(req, res){
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    placeStore.getPlaceByUrl(placeUrl).then(function (newLinkedPlace) {
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
        if(toTeardown) {
            return teardownLinkedPlace(toTeardown).then(function () {
                setUpLinkedPlace(newLinkedPlace);
            });
        }else{
            return setUpLinkedPlace(newLinkedPlace);
        }

    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(false));
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(true));
};