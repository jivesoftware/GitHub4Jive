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

var githubCommonLibDir = process.cwd() + "/common/";
var strategyBuilderBase = require(githubCommonLibDir + "github4jive/strategies/StrategySetBuilderBase");

/**
 * This class is an overide of StrategySetBuilderBase
 * It exposes the two strategies in a fluent api that supports chaining.
 * NOTE: Build and reset should not be overridden.
 */
function builder(){
    strategyBuilderBase.apply(this);
}
builder.prototype = new strategyBuilderBase();


var issues = require("./issueStrategy");
//var issueComments = require("./IssueCommentStrategy");

builder.prototype.issues = function(){
    this.strategies.push(issues);
    return this;
};

//builder.prototype.issueComments = function(){
//    this.strategies.push(issueComments);
//    return this;
//};

module.exports = builder;