GitHub for Jive - Developer Notes
=================================


The places service is responsible for serving requests that deal with place configuration.
It also handles the bootstrapping and runtime changes of event handlers attached to those places.
This is done through the overridden Event Strategies and StrategySetBuilder.