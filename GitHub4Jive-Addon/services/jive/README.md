GitHub for Jive - Developer Notes
=================================

This service is for anything that is coming from Jive or anything coming from the
browser that will go to or query Jive via a proxied api call that cannot be serviced
with the osapi javascript functionality.


Jive OAuth is handled in the routes/oauth directory.

jiveController
--------------

Handles the http routes that are related to proxied Jive Api calls and handling Jive 
webhooks. 

jiveCommentHandler
------------------

Is used to handle comments that have been created on discussion and posted to the jiveController
through a Jive Webhook. It sends those comments over to GitHub if they are not already there.

issueStateChangeHandlers
------------------------

These functions are used to respond to the events that represent state changes. Currently, 
marking a discussion as final or marking a comment as the answer can be used to close an issue.
Also, at the time of writing (9/15/14) Jive does not emit events for removing an answer or
outcome. So there is no native way to reopen an issue. Instead this is handled with app actions.