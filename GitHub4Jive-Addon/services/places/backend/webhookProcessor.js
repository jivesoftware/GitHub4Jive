var libDir = process.cwd() + "/lib/";
var strategySkeletonBase = require(libDir + "github4jive/strategies/EventStrategySkeleton");

var WebhooksProcessorBuilder = require("./StrategySetBuilder");

function webhookProcessor(instancePredicate, setupOptionsProvider, teardownOptionsProvider){
    var configurator = new WebhooksProcessorBuilder()
        //
        .attachGitHubIssueResponders()
        //
        .attachGitHubIssueCommentResponders();

    strategySkeletonBase.apply(this,instancePredicate, setupOptionsProvider, teardownOptionsProvider);
    strategySkeletonBase.configurator = configurator;
}

webhookProcessor.prototype = new strategySkeletonBase();

module.exports = webhookProcessor;



