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

/**
 overrides jive-sdk/routes/oauth.js to do something useful,
 like storing access token for the viewer
 */

var url = require('url');
var util = require('util');
var jive = require('jive-sdk');
var mustache = require('mustache');

var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');
var myOauth = Object.create(sdkInstance);
var libDir = process.cwd() + "/lib/";
var tokenStore = require( libDir + "github4jive/placeStore");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// public

module.exports = myOauth;

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

