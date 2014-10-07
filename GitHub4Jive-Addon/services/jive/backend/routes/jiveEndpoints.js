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

var jive = require('jive-sdk');
var fs = require('fs');
var jiveController = require("./../jiveController") ;
var service = require('./../jiveOAuthController.js');

exports.webhookPortal = {
    'verb' : 'post',
    'path' : '/webhooks',
    'jiveLocked' : true,
    'route' : jiveController.webHookPortal
};

exports.authorizeUrl = {
    'path' : '/jive/oauth/authorize',
    'verb' : 'get',
    'jiveLocked' : true,
    'route': service.authorizeUrl.bind(service)
};

exports.oauth2Callback = {
    'path' : '/jive/oauth/callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};
