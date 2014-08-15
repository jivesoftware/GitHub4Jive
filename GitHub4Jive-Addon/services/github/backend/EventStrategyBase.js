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
var gitHubFacade = require("../../../common/GitHubFacade");


exports.name = "BASE_THIS_SHOULD_BE_OVERWROTE";

exports.setup = function(setupOptions) {

}

exports.teardown = function(teardownOptions){
    var token = teardownOptions.eventToken;
    var auth = {"type": "oauth", "token":teardownOptions.gitHubToken};
    return gitHubFacade.unSubscribeFromRepoEvent(token,auth);
};