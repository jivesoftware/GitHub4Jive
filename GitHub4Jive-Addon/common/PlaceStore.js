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

var store = jive.service.persistence();

exports.save = function(placeUrl, token){
    if(!placeUrl || placeUrl === "" || typeof placeUrl !== "string"){
        throw Error("Invalid Place");
    }
    return store.findByID("tokens", placeUrl).then(function (found) {
        var record = found || {};
        for(var m in token){record[m] = token[m];} //overwrite old members or add new ones
        var delimitter = "/";
        var tokens = placeUrl.split(delimitter);
        var domainTokens = tokens.slice(0, 3);

        record.jiveUrl =  domainTokens.join(delimitter);
        record.placeID =  tokens[tokens.length -1];
        record.placeUrl = placeUrl;
        return store.save("tokens", placeUrl, record).then(function(){
            return record;
        });
    })
};

exports.getAllPlaces = function(){
    return store.find("tokens");
};


exports.getPlaceByUrl = function(placeUrl){
    return store.findByID("tokens", placeUrl);
};