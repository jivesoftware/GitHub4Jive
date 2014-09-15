GitHub for Jive - Developer Notes
=================================

Please put any tests that you need into the library sub directory.
==================================================================

The Jive Testing Framework is set up to run [mocha](http://visionmedia.github.io/mocha/) by executing run.js with node 
( node run.js on the command line from the test directory) All files in the library directory will automatically 
be picked up and tested.

To better support testing promises it is recommended to use the [Chai assertion library](http://chaijs.com/api/bdd/)
 and [Chai as Promised](http://chaijs.com/plugins/chai-as-promised). Using this will also provide a uniform set 
 of assertion errors. Examples can be found in the GitHubFacade file.