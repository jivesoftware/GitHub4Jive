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

var util = require('util');
var jive = require('jive-sdk');
var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');
var myOauth = Object.create(sdkInstance);
var libDir = process.cwd() + "/lib/";
var placeStore = require(libDir + "github4jive/placeStore");

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// public

module.exports = myOauth;

myOauth.fetchOAuth2Conf = function() {
    return jive.service.options['jive']["oauth2"];
};

myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    console.log("************************* OAUTH CALLBACK");
    console.log('************************* State', state);
    console.log('************************* originServerAccessTokenResponse', originServerAccessTokenResponse);

    var placeRef = state.context.place;

    var toStore = {};
    toStore.jive = originServerAccessTokenResponse.entity;
    toStore.jive.userID =  state['viewerID'];
    placeStore.save(placeRef, toStore).then( function() {
        console.log('************************* doing callback');
        callback({'ticket': state['viewerID'] });
    });
};

myOauth.getTokenStore = function() {
    return placeStore;
};
