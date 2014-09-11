Recent Issues Tile Backend
==========================

The backend of the Recent Issues Tile is pretty simple consisting of just 3 main files.

datapusher.js
-------------

datapusher is responsible for the tile instances and pushing data to them. When the 
service starts it registers a callback to the onBootstrap event that sets up all 
the GitHub event handlers for current instances. Then it pushes data each one. 
It also pushes data to the tile instances every minute.

When a new tile registers a new set of GitHub event handlers are created for the new
instance. These are handled by the [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
instance called strategyProvider.

When a tile is updated the instance's event handlers are destroyed and then reconstructed
with any new values. This is also handled with the  [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies).


issueStrategy.js
----------------

This overrides the [EventStrategyBase](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
and provides a way to push data into a tile instance when a GitHub issue changes state. 

It overrides the setup function and in tandem with the setupOptions provided in the dataPusher
holds a reference to the tile instance and processTileInstance function.

StrategySetBuilder.js
---------------------

This overrides the [StrategySetBuilderBase](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
class that provides the framework for setting up and tearing down multiple strategies at runtime. 
This implementation is rather simple because it only exposes a single strategy. The builder is used
with the [EventStrategySkeleton](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/node_modules/github4jive/strategies)
to provide the set of strategies to create for each tile instance.