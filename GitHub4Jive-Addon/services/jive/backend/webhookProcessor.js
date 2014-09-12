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
var q = require("q");

var helpers = require("./helpers");
var jiveCommentHandler = require("./jiveCommentHandler");
var issueStateChangeHanlder = require("./issueStateChangeHandlers");

var ISSUE_EVENTS = ["jive:outcome_set","jive:correct_answer_set","jive:outcome_removed","jive:correct_answer_removed"];

function itIsAnIssueStateChangeEvent(event){
    return ISSUE_EVENTS.indexOf(event) >= 0;
}

function processIssueStateChange(payload){
    var place = payload.target.id;
    var event = payload.verb;
    var obj = payload.object;

    //currently, EAE does not emit events for outcome remove or answer removed so there are no cases for those in this branch
    if(event == "jive:outcome_set"){
        //discussion marked final etc
        return issueStateChangeHanlder.changeIssueStateFromOutcome(place, obj);
    }else  if (obj.objectType == "jive:message" ){
        //message was marked correct
        return issueStateChangeHanlder.changeIssueStateFromMarkedAnswer(place, obj);
    }else{
        return q();
    }
}

function itIsReply(event, hookPayload) {
    return event == "jive:replied" && hookPayload.object.summary;//ignore blank comments that may be created for remove answer hack
}

function processPayload(hookPayload){
    var event = hookPayload.verb;
    jive.logger.debug(hookPayload.object);

    if(itIsReply(event, hookPayload)){
        return jiveCommentHandler.createGitHubComment( hookPayload);
    }else if( itIsAnIssueStateChangeEvent(event)){
        return processIssueStateChange(hookPayload);
    }else{
        return q();
    }
    //return a promise to enable the sequential processing of events
}

function  sequentiallyProcessPayloads(payloads, index){
    var payload = payloads[index];
    if(!payload){
        return q();
    }
    return processPayload(payload.activity).then(function () {
        return sequentiallyProcessPayloads(payloads, ++index);
    });
}

/*
 * To preserve ordering of the payloads each processing call is chained recursively
 * one after another
 * @param {[object]} payloads Jive webhook payloads
 * @return {promise} blank promise to wait for completion and catch errors;
 */
exports.sequentiallyProcessPayloads = function(payloads){
    return sequentiallyProcessPayloads(payloads,0).then(function () {
        return q();
    });
};