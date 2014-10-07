Issue Activity Tile Backend
==========================

The backend of the Issue Activity Tile is pretty simple consisting of just 3 main files.

datapusher.js
-------------

datapusher is responsible for the tile instances and pushing data to them. When the 
service starts it registers a callback to the onBootstrap event that sets up all 
the GitHub event handlers for current instances that are configured to post activity. 


When a new tile registers a new set of GitHub event handlers are created for the new
instance. These are handled by the [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies#eventstrategyskeleton-class)
instance called strategyProvider.

When a tile is updated the instance's event handlers are destroyed and then reconstructed
with any new values. This is also handled with the  [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies#eventstrategyskeleton-class).


issueStrategy.js
----------------

This overrides the [EventStrategyBase](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies#eventstrategybase-abstract-class)
and listens for a GitHub issue state change event. If it is reopened, closed, or relabeled
then a activity entry is generated with corresponding message and link to relevant discusssion.

It overrides the setup function and in tandem with the setupOptions provided in the dataPusher.
Unlike the Recent Issues Tile, it does not require a reference to a processTileInstance function
because the datapusher itself ironically does not do any pushing. 
