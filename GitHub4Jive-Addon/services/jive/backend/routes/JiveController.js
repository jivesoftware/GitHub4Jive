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

var placeStore = require("../../../../common/PlaceStore");

exports.placeCurrentConfig = function (req, res) {
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        var clientSideConfig = {github: false, jive: false};
        try{
            if(linked.github.token.access_token){
                clientSideConfig.github = true;
            }
        }catch(e){

        }
        try{
            if(linked.jive.access_token){
                clientSideConfig.jive = true;
            }
        }catch(e){

        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clientSideConfig));
    })
}