GitHub for Jive - Developer Notes
=================================

Please put any tests that you need into the library sub directory.
==================================================================

The Jive Testing Framework is set up to run mocha by executing run.js with node ( node run.js on the command line from the test directory)
All files in the library directory will automatically be picked up and tested 

To better support testing promises it is recommended to use the Chai assertion library and Chai as Promised. Using this will
also provide a uniform set of assertion errors. Examples can be found in the GitHubFacade file.