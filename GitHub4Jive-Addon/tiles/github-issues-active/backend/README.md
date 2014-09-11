Issue Activity Tile Backend
==========================

The backend of the Issue Activity Tile is pretty simple consisting of just 3 main files.

datapusher.js
-------------

datapusher is responsible for the tile instances and pushing data to them. When the 
service starts it registers a callback to the onBootstrap event that sets up all 
the GitHub event handlers for current instances that are configured to post activity. 


When a new tile registers a new set of GitHub event handlers are created for the new
instance. These are handled by the [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
instance called strategyProvider.

When a tile is updated the instance's event handlers are destroyed and then reconstructed
with any new values. This is also handled with the  [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies).


issueStrategy.js
----------------

This overrides the [EventStrategyBase](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
and listens for a GitHub issue state change event. If it is reopened, closed, or relabeled
then a activity entry is generated with corresponding message and link to relevant discusssion.

It overrides the setup function and in tandem with the setupOptions provided in the dataPusher.
Unlike the Recent Issues Tile, it does not require a reference to a processTileInstance function
because the datapusher itself ironically does not do any pushing. 

StrategySetBuilder.js
---------------------

This overrides the [StrategySetBuilderBase](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
class that provides the framework for setting up and tearing down multiple strategies at runtime. 
This implementation is rather simple because it only exposes a single strategy. The builder is used
with the [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
to provide the set of strategies to create for each tile instance.

Another strategy could be added to listen for comments on issues that do not have linked 
discussions.