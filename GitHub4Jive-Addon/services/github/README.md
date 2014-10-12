![]("GitHub for Jive - Developer Notes")

This service is for anything that is coming from Github or anything coming from the
browser that will go to or query Github via a proxied api call.

**backend/gitHubController.js**
  * GET /github/user/repos
  * GET /github/place/issues
  * POST /github/place/newIssue
  * POST /github/place/changeIssueState
  * POST /github/place/changeIssueLabels
  * GET /github/place/comments
  * POST /github/place/newComment

**backend/gitHubOAuthController.js**
------------------------
GET /github/oauth/callback
GET /github/oauth/authorize
