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
var jive = require("jive-sdk");


function JiveOauth(placeUrl,accessToken, refreshToken){
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    var self = this;
    this.tokenPersistenceFunction =
            function (newTokens, community){
                self.accessToken = newTokens.access_token;
                self.refreshToken = newTokens.refresh_token;
                placeStore.save(placeUrl,{jive:newTokens});
            };
}

module.exports = JiveOauth;
//move circular require after export to avoid circular dependency bug
var placeStore = require("./PlaceStore");

JiveOauth.prototype.applyTo = function(url, body, headers){
    return {
        'url' : url,
        'headers' : headers,
        'postBody': body,
        'oauth' : {
            'access_token' : this.accessToken,
            'refresh_token' : this.refreshToken
        },
        'tokenPersistenceFunction' : this.tokenPersistenceFunction
    };
};

