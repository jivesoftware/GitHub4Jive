var url = require('url');
var util = require('util');
var jive = require('jive-sdk');
var mustache = require('mustache');

var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');

var myOauth = Object.create(sdkInstance);

module.exports = myOauth;

var tokenStore = require("github4jive/PlaceStore");

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

myOauth.fetchOAuth2Conf = function() {
    jive.logger.debug("fetchOAuth2Conf ...");
    return jive.service.options['github']['oauth2'];
};

myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    jive.logger.debug("oauth2SuccessCallback ...");
    jive.logger.debug('State', state);
    jive.logger.debug('GitHub Response: ', originServerAccessTokenResponse['entity']);

    var placeRef = state.context.place;

    var tokenID = jive.util.guid();
    var tokenRaw = originServerAccessTokenResponse['entity']['body'].toString();

    var tokenParams = tokenRaw.split('&');
    var token = {};
    tokenParams.forEach(function (p) {
        if (p.indexOf('access_token') == 0) {
            token['access_token'] = decodeURIComponent(p.split("=")[1]);
        }
        if (p.indexOf('scope') == 0) {
            token['scope'] = decodeURIComponent(p.split("=")[1]);
        }
        if (p.indexOf('token_type') == 0) {
            token['token_type'] = decodeURIComponent(p.split("=")[1]);
        }
    });

    var toStore = {"github": {
      userID : state['viewerID'],
      tokenID : tokenID,
      token: token
    }};

    tokenStore.save( placeRef, toStore).then( function() {
        callback({'ticket': tokenID });
    });
};

myOauth.getTokenStore = function() {
    return tokenStore;
};

