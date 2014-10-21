# GitHub4Jive Sequences and Code Refs

## Browsing GitHub Issues in Jive Places

Using a App Tab in a Purposeful Place to view GitHub issues in Jive

### Browsing GitHub Issues #1: Place Config

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-place1.jpg "Browsing Issues 1")

* (0,1) [App contributes a place config modal view](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L83)
  * (1) The [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/place-config.html) references [JS, which launches 3-legged OAuth with Jive & GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199)
* (1) At the conclusion of OAuth dancing, the browser invokes service endpoints for [storing the access tokens](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/docs/sample-place-store.json)
  * GitHub [endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L114) and [controller for storing the access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42) @ <b>/github/oauth/callback</b>
  * Jive [endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js#L44) and [controller for storing Jive access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js#L37) @ <b>/jive/oauth/callback</b>
* (2) [Fetch a list of GitHub repos to choose from, using access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L75) @ <b>/github/user/repos</b> 
* (3) [On config save, modal calls Jive to save ext place properties identifying selected repo](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L280) @ <b>[/api/core/v3/places/[placeID]/extprops](https://developers.jivesoftware.com/api/v3/cloud/rest/PlaceService.html#createExtProps(UriInfo,%20String,%20String,%20String))</b>
* (5) [App contributes a place tab view](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L113)

### Browsing GitHub Issues #2: App Tab

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-place2.jpg "Browsing Issues 2")

* (6) The [tab view HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/place-tab.html) references [JS, calls service to proxy fetch of GitHub issues](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/place-tab.js#L23)
* [Service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L52) for fetching GitHub issues @ <b>/github/place/issues</b>
  * [Controller invokes place store for place details](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L84)
    * [Finds local record](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/placeStore.js#L115), and 
    * (7) [queries Jive for place ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/placeStore.js#L81) @ <b>[/api/core/v3/places/[placeID]/extProps](https://developers.jivesoftware.com/api/v3/cloud/rest/PlaceService.html#getExtProps(String,%20String))</b>
  * (8) [Service controller uses linked GitHub repo, queries GitHub for issues](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L86)
* (9,10) [Places tab JS recieves list of issues and updates the tab DOM](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/place-tab.js#L30)

## Managing GitHub Issues using Jive Tiles

Using Tiles in a Purposeful Place to track GitHub issues 

### Managing GitHub Issues #1: Tile Config

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-tile1.jpg "Issue Management 1")

* Tiles contribute a place config modal
  * [Recent issues](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L21) and [project info](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L21) tile definitions declare a source for config modal
  * [Endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L12) and [controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L70) serves up the [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html) and its [JS](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js) @ <b>/github4jive/basicTileConfig</b>
* (12) [Service tile registration handler responds to tile registrations](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L46)
  * [Tile webhooks setup logic](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookBuilder.js#L28) establishes a (13)(14) [GitHub issue state change handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L30)
  * Handler injects its callback function into [gitHubFacade for the purpose of subscribing to issue events](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L211)
  * (15) [Fetches recent issues and pushes an update to the tile](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L35)

### Managing GitHub Issues #2: Update Tile

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-tile2.jpg "Issue Management 2")

* (Sequence 16) [GitHub calls service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28) in response to GitHub issue creation @ <b>/github/WebHookPortal</b>
* (16) [Service controller forwards event from request to gitHubFacade to trigger event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
* (16,17) [gitHubFacade locates registered event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
  * (17) [Recent issues handler is executed, and recent issues are acquired/pushed to the tile](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L38)

### Managing GitHub Issues #3: Tile Action

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-tile3.jpg "Issue Management 3")

* (18) [Endpoint URL specified in tile definition](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L20) creates clickable tile entries
* The tile [action endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/routes/actionEndpoint.js) serves the [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/action.html) and the [JS for closing an issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/javascripts/action.js#L84)
* The [tile push logic defines issue metadata as part of tile JSON push](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L57) which is provided to the modal
* JS calls the [endpoint for proxying close issue calls to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66) @ <b>/github/place/changeIssueState</b>
  * (19) [Service controller invokes gitHubFacade to make calls to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143)
  * [gitHubFacade calls to GitHub API to close the issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L158)
* [GitHub calls service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28) in response to GitHub issue update @ <b>/github/WebHookPortal</b>
* [Registered webhook handler is invoked to update the recent issues tile](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L30)

## Discussing Issues

Using a Jive discussion to comment on a GitHub issue

### Discussing Issues #1: Create Discussion

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-discuss1.jpg "Issue Discussions 1")

* During place config, webhooks are established to model GitHub issues as Jive discussions
  * The [config modal JS calls place setup endpoint] (https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L291) to trigger webhooks setup @ <b>/github4jive/place/setupDiscussionWebhooks</b>
  * The [endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22) and its (<b>*</b>) [controller kicks off GitHub and Jive webhooks setup](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookBuilder.js#L30)
* The [GitHub webhooks setup code defines an issue handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L38)
  * (20) [Calls jive to create discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L94) when triggered by an incoming GitHub event @ <b>[/api/core/v3/contents](https://developers.jivesoftware.com/api/v3/cloud/rest/ContentService.html#createContent(String,%20String,%20String,%20String))</b>
  * (21) [Calls Jive to write ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L70) linking the discussion to a GitHub issue, using [the jiveApiFacade to make the actual call](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L229) @ <b>[/api/core/v3/contents/[contentID]/extProps](https://developers.jivesoftware.com/api/v3/cloud/rest/ContentService.html#createExtProps(UriInfo,%20String,%20String,%20String))</b>

### Discussing Issues #2: Reply to Discussion

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-discuss2.jpg "Issue Discussions 2")

* [GitHub calls the service webhook endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28) in response to GitHub issue comment @ <b>/github/WebHookPortal</b>
  * [Service controller forwards event to GitHubFacade for processing](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
  * [GitHubFacade looks up registered event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
* [Place issue comment handler is invoked](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L42)
  * (22) [Queries Jive for related discussion via ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/helpers.js#L18) @ <b>[/api/core/v3/extprops/github4jiveIssueId/[issueID]](https://developers.jivesoftware.com/api/v3/cloud/rest/ExtPropsService.html)</b>
  * (23) [Creates a reply based on issue comment] (https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L73), [calls Jive to post the reply](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L208) @ <b>[/api/core/v3/messages/contents/[discussionID]](https://developers.jivesoftware.com/api/v3/cloud/rest/MessageService.html)</b>

### Discussing Issues #3: Add Comment on GitHub

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-discuss3.jpg "Issue Discussions 3")

* During place config, a [Jive service webhook is registered](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L107)
* (24) [Jive invokes service webhook endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js#L27) in response to a Jive discussion reply
* (24) The [endpoint controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveController.js#L30) forwards the event to [the webhook processor](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/webhookBuilder.js#L74) which determines its a discussion reply and delegates processing to its issue comment handler
* The issue comment handler resolves the related GitHub issue and posts the comment based on the reply
  * (24) [Handler fetches jive message](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L38) based on webhook payload @ <b>[/api/core/v3/message/[messageID]](https://developers.jivesoftware.com/api/v3/cloud/rest/MessageService.html)</b>
  * (24) [Handler fetches associated discussion's ext props to locate linked GitHub issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L47) @ <b>[/api/core/v3/contents/[discussionID]/extProps](https://developers.jivesoftware.com/api/v3/cloud/rest/ContentService.html#getExtProps(String,%20String))</b>
  * (25) [Handler calls GitHub facade to post a new comment on the issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L59)
  * (25) [GitHub facade posts a new issue comment](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L191)

## Modeling Workflows with App Actions

Using dynamic Jive app actions to open and close GitHub issues 

### Modeling Workflows #1: App Action (Close)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-appaction1.jpg "Issue Actions 1")

* (26) The [app contributes close action to the discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L71). For a new issue:
  * The reopen action is hidden as the closed ext prop (<b>github4jiveIssueClosed</b>) is not set; correspondingly, the close action is visible
  * See the [app action contribution reference](https://community.jivesoftware.com/docs/DOC-114464)

### Modeling Workflows #2: App Action (Reopen)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/jw-appaction2.jpg "Issue Actions 2")

* Clicking the close action produces an [app view modal](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/issue-close.html) and its [JS](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/issue-close-reopen.js#L30)
  * The [JS](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/issue-close-reopen.js#L30) calls the change issue service endpoint @ <b>/github/place/changeIssueState</b>
  * The [service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66) and its [controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143) closes the specified issue
* GitHub calls the service webhook endpoint, triggering the [github place issue handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L38)
  * (27) The handler updates [discussion ext properties, setting the property indicating closure](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L123)
* On view, the [app contributes reopen action to the discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L77)

