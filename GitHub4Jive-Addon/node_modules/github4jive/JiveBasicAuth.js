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

var crypto = require("crypto");

/**
 * This is not used in production
 */
var salt = "jdvksdoierhgiohdfksvnjk;dioereirfiohio3489jiohj349iowejiojfkldnjufiowejioewikerjfio";
//These should probably be set to some sensible values. I have no idea what they should be.
var keyIterations = 1000;
var keyLength = 256;
//////////////////////////////

var randomPassKey = crypto.randomBytes(256);
var key = crypto.pbkdf2Sync(randomPassKey, salt, keyIterations, keyLength);
var algorithm = "aes256";

function encrypt(text){
    var cipher = crypto.createCipher('aes-256-cbc',key)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher('aes-256-cbc',key)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

function JiveBasicAuth(username, password){
    this.username = username;
    this.encryptedPassword = encrypt(password);
}
function base64Encoding(auth){
    return new Buffer(auth.username + ":" + decrypt(auth.encryptedPassword)).toString('base64');
}

JiveBasicAuth.prototype.applyTo = function (url, body, headers) {
    var encoding = base64Encoding(this);
    headers.Authorization = "Basic " + encoding;

    return {
        'url' : url,
        'headers' : headers,
        'postBody': body
    };
};

JiveBasicAuth.prototype.headerValue = function(){
    return "Basic " + base64Encoding(this);
};

module.exports = JiveBasicAuth;