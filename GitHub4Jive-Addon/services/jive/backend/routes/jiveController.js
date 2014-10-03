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

var https = require("https");
var url = require('url');
var jive = require("jive-sdk");
var q = require("q");

var processor = require("./../webhookProcessor");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// public

/*
 * This endpoint handles POSTS from Jive. These webhook payloads are processed in this controller.
 * There is currently no validation that the request is from Jive.
 */
exports.webHookPortal = function (req, res) {
    //sort payloads oldest to newest
    var hookPayloads = req.body.sort(function (a,b) {
        return new Date(a.activity.published).getTime() - new Date(b.activity.published).getTime();
    });

    //now process each payload one at a time to preserve chronological order of comments
    processor.sequentiallyProcessPayloads(hookPayloads).then(function () {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
    }).catch(function (error) {
        jive.logger.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    });
};