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

var libDir = process.cwd() + "/lib/";
var GitHubWebhookEventHandler = require(libDir + "github4jive/GitHubWebhookEventHandler");
var tileInstanceProcessor = require("../tileInstanceProcessor");

var thisHandler = Object.create(GitHubWebhookEventHandler);
thisHandler.name = "Recent_Issue";

module.exports = thisHandler;

/**
 * This handler tells the recent issue tile to push new data whenever an GitHub issue changes state.
 */
thisHandler.setup = function(setupOptions){

    var self = this;
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var auth = self.gitHubFacade.createOauthObject( setupOptions.gitHubToken);
    var instance = setupOptions.instance;

    return self.gitHubFacade.subscribeToRepoEvent(owner, repo, self.gitHubFacade.Events.Issues, auth, function () {
        // invoke the tile data push
        tileInstanceProcessor.processTileInstance(instance);
    });
};
