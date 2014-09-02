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
var Q = require("q");
var store = jive.service.persistence();
var JiveApi = require("./JiveApiFacade");
var JiveOauth = require("./JiveOauth");

var STORE_NAME = "places";

function recursiveOverwrite(record,newObject){
    if (typeof(newObject) === "object" || typeof newObject === "array") {
        for(var m in newObject) {
            if(record[m]){
                recursiveOverwrite(record[m], newObject[m]);
            }else {
                record[m] = newObject[m];
            }
        }

    }else{
        record = newObject;
    }

}

exports.save = function(placeUrl, newObject, dontStamp){
    if(!placeUrl || placeUrl === "" || typeof placeUrl !== "string"){
        throw Error("Invalid Place");
    }
    return store.findByID("tokens", placeUrl).then(function (found) {
        var record = found || {};
        recursiveOverwrite(record, newObject);
        var delimitter = "/";
        var tokens = placeUrl.split(delimitter);
        var domainTokens = tokens.slice(0, 3);

        record.jiveUrl =  domainTokens.join(delimitter);
        record.placeID =  tokens[tokens.length -1];
        record.placeUrl = placeUrl;
        record.invalidCache = !dontStamp;
        return store.save(STORE_NAME, placeUrl, record).then(function(){
            return record;
        });
    })
};

exports.invalidateCache = function(placeUrl){
    if(!placeUrl || placeUrl === "" || typeof placeUrl !== "string"){
        throw Error("Invalid Place");
    }
    var self = this;
    return self.save(placeUrl).then(function (record) {
        return pullExternalPropertiesIn(self, record);
    })
}

function pullExternalPropertiesIn(self,linked){
    if(linked &&
        linked.jive &&
        (linked.github && (!linked.github.repoOwner || !linked.github.repo)
            || linked.invalidCache)){
        //cache repo information
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var jauth = new JiveOauth(linked.placeUrl,linked.jive.access_token, linked.jive.refresh_token);
            var japi = new JiveApi(community, jauth);
            return japi.getAllExtProps("places/" + linked.placeID).then(function (extprops) {
                linked.github.repo = extprops.github4jiveRepo;
                linked.github.repoOwner = extprops.github4jiveRepoOwner;
                var githubReplacement = {"github": linked.github};
                return self.save(linked.placeUrl, githubReplacement, true);
            })
        });

    }else{
        return linked;
    }
}

exports.getAllPlaces = function(){
    var self = this;
    return store.find(STORE_NAME).then(function (linkedPlaces) {
        return Q.all(linkedPlaces.map(function (linked) {
            return pullExternalPropertiesIn(self, linked);
        }));
    });
};


exports.getPlaceByUrl = function(placeUrl){
    var self = this;
    return store.findByID(STORE_NAME, placeUrl).then(function (linked) {
        return pullExternalPropertiesIn(self,linked);
    });
};