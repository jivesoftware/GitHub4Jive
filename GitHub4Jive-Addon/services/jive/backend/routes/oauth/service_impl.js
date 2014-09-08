var util = require('util');
var jive = require('jive-sdk');

var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');

var myOauth = Object.create(sdkInstance);

module.exports = myOauth;

var placeStore = require("github4jive/common/PlaceStore");

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

myOauth.fetchOAuth2Conf = function() {
    return jive.service.options['jive']["oauth2"];
};

myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    console.log('State', state);
    console.log('originServerAccessTokenResponse', originServerAccessTokenResponse);

    var placeRef = state.context.place;

    var toStore = {};
    toStore.jive = originServerAccessTokenResponse.entity;
    toStore.jive.userID =  state['viewerID'];
    placeStore.save(placeRef, toStore).then( function() {
        callback({'ticket': state['viewerID'] });
    });
};

myOauth.getTokenStore = function() {
    return placeStore;
};
