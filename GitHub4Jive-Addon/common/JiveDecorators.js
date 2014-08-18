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

exports.decorateIssueWithJiveContent = function (jiveApi, issue) {
    if(!issue.number){
        throw Error("Invalid Issue");
    }
    return jiveApi.getByExtProp("github4jiveIssueId",issue.number).then(function (found) {
        if(found.list.length != 1){
            jive.logger.debug("Issue: " + issue.number + "has no linked content or more than 1");
        }else{
            issue.jiveContentLink = found.list[0];
        }
        return issue;
    })
}