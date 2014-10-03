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

var githubCommonLibDir = process.cwd() + "/common/";
var gitHubFacade = require(githubCommonLibDir + "github4jive/gitHubFacade");

var strategyBase = require(githubCommonLibDir + "github4jive/strategies/EventStrategyBase");
var issueStrategy = Object.create(strategyBase);
module.exports = issueStrategy;

issueStrategy.name = "Recent_Issue";


/**
 * This strategy simply tells the recent issue tile to push new data anytime an issue changes state.
 * The reason the processing logic isn't here is because it is primarily used from the datapusher itself.
 * Thus a reference to the processing function is all that is necessary.
 *
 * Client code should never be calling this function directly. It should be called from the StrategySetBuilderBase.
 * Which is invoked from the StrategySet.setup function returned from builder.build().
 *
 * Override of EventStrategyBase.Setup
 * SetupOptions are provided by a placeController.
 *
 */
issueStrategy.setup = function(setupOptions){
    var owner = setupOptions.owner;
    var repo = setupOptions.repo;
    var auth = gitHubFacade.createOauthObject( setupOptions.gitHubToken);
    var instance = setupOptions.instance;
    var processFunction = setupOptions.processTile;

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth, function () {
       processFunction(instance);
    });
};
