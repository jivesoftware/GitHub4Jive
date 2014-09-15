
App Actions
===========

Create New GitHub Issue
----------------------

Is available from the place action menu after the place has been linked
to a GitHub Repository. It brings up a modal box that allows the user
to add an issue title and body. The label editor present of the Recent Issues
Tile action could also be added to this dialog.

Issues Table Tab Action
----------------------

Adds a "page" to the places navbar. The page contains a table of all issues
for the linked repository. If and when stories are expanded to pull requests,
commits, etc this page will need to be expanded and reworked to make sense.

Go to Issue
-----------

This app action shows up on a discussion that is linked to a GitHub issue.
This is done by reading the external properties and looking for a specific
link property. It also uses this property to set the url directly to the
issue.

Edit Issue Labels
-----------------

Also available on discussions linked to a GitHub issue. It brings up a
modal dialog to edit the current labels on the issue. 

Close/Reopen Issue contextual action
------------------------------------

These use operators on external properties to detect which one needs to be
displayed. Specifically, it uses the equals operator and the 
github4jiveIssueClosed property and check for true/false. Both bring up 
a small dialog that displays the progress of the state change and then reload
the page to display the result of the state change.

Place Config Action
------------------

This action is visible on the place settings page. Under the Stream Tile 
configuration box is the Project Features and Activity section with a gear
on the right side. After clicking that gear a dialog come up with a link to
this action. 

This action is just another endpoint to link the place to a repository. This will
not set up tiles.

