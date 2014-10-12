GitHub for Jive - Developer Notes
=================================


The service will be responsible for all hidden interactions between GitHub and Jive.
Use Webhooks from Jive to create issues and comments on GitHub. Use Webhooks from GitHub
to create discussions/documents, activity stream entries, etc. 



GitHub & Jive Services
--------------

Have no long running processes. They currently are simply controllers for proxied calls
to respective systems. They also house the endpoints for respective webhook endpoints to 
receive payloads. 

Place Service
-------------

The place service keeps state information about places that have registered event handlers.
When a place is added or updated by the ui it should post to the trigger route. This will
handle the teardown/setup of new/updated places.

There is currently no way to delete or unwire a place from GitHub4Jive. If that functionality
is added later, then it will need to be implemented on the placeController.


