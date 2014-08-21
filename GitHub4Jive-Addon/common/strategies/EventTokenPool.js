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

function TokenPool(){
    this.tokens = {};
}

exports.INVALID_KEY = "INVALID_TOKEN_KEY";
exports.INVALID_TOKEN = "INVALID_TOKEN";
exports.DUPLICATE_KEY = "DUPLICATE_TOKEN_KEY";

TokenPool.prototype.addToken = function (key, token) {
    if(!key || key.match(/\s+/) ){
        throw Error(this.INVALID_KEY);
    }
    if(this.tokens[key]){
        throw Error(this.DUPLICATE_KEY);
    }
    if(!token){
        throw Error(this.INVALID_TOKEN);
    }
    this.tokens[key] = token;
};

TokenPool.prototype.getByKey = function (key) {
    return this.tokens[key] || false;
}

TokenPool.prototype.removeTokenByKey = function (key) {
    return (delete this.tokens[key]);
};

TokenPool.prototype.tokenKeys = function () {
    return Object.keys(this.tokens);
};

TokenPool.prototype.allTokens = function () {
    var self = this;
    return this.tokenKeys().map(function (key) {
        return self.tokens[key];
    });
};


module.exports = TokenPool;