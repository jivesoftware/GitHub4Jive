# GitHub4Jive Sequences and Code Refs

## Browsing GitHub Issues in Jive

Using a Place Tab to view GitHub issues in Jive

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/place1.jpg "Issue Browser")

* **Sequence 1:** Capture Jive & GitHub access tokens
  * [Service structure](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon)
  * [App contributes a place config modal view](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L83)
    * The [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/place-config.html) references [JS, which launches 3-legged OAuth with Jive & GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199)
  * At the conclusion of OAuth dancing, the browser invokes service endpoints for storing the access tokens
    * GitHub [endpoint definition](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L114) and [controller for storing the access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42) @ <b>/github/oauth/callback</b>
    * Jive [endpoint definition](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js#L44) and [controller for storing Jive access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js#L37) @ <b>/jive/oauth/callback</b>
  * [Place store JSON showing Jive & GitHub access tokens](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/docs/sample-place-store.json)

* **Sequence 2:** Browse GitHub repo issues in Jive place tab view
  * [App contributes a place tab view](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L101)
    * The [tab view HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/place-tab.html) references [JS, calls service to fetch issues from GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/place-tab.js#L23)
  * [Service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L52) for fetching GitHub issues @ <b>/github/place/issues</b>
    * [Controller invokes place store for place details](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L84)
      * [Finds local record](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/placeStore.js#L115)
      * [Queries Jive for place ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/placeStore.js#L79) @ <b>[jiveURL]/api/core/v3/places/[placeID]/extProps</b>
    * [Service controller uses linked GitHub repo, queries GitHub for issues](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L86)
  * [Places tab JS recieves list of issues and updates the tab DOM](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/javascripts/actions/place-tab.js#L30)

## Managing GitHub Issues via Tiles

Using Tiles in a Purposeful Place to track GitHub issues 

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues1.jpg "Issue Management 1")

* **Sequence 3 & 4:** Jive tile registration --> setup GitHub webhooks, update Jive tiles
  * [Tiles directory](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles)
  * Tiles contribute a place config modal
    * [Recent issues](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L21) and [project info](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L21) tile definitions declare a source for config modal
    * [Endpoint definition](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L12) and [controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L70) serves up the [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html) and its [JS](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js) @ <b>/github4jive/basicTileConfig</b>
  * [Service tile registration handler establishes a GitHub issue state change webhook](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L54)
    * [Tile webhooks setup logic](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookBuilder.js#L28) establishes a [GitHub issue state change handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L30)
    * Handler injects its callback function into [gitHubFacade for the purpose of subscribing to issue events](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L211)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues2.jpg "Issue Management 2")

* **Sequence 5:** Create GitHub issue --> Update Jive tiles
  * [GitHub calls service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28) in response to GitHub issue creation @ <b>/github/WebHookPortal</b>
  * [Service controller forwards event from request to gitHubFacade to trigger event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
  * [gitHubFacade locates registered event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
    * [Recent issues handler is executed](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L38)
    * [Handler triggers fetch of recent issues, and uses gitHubFacade to push an update to the Jive tile](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues3.jpg "Issue Management 3")

* **Sequence 6 & 7:** Close GitHub issue via tile action --> update Jive tiles
  * The [tile push logic defines issue metadata as part of tile JSON push](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L83)
    * [Endpoint URL specified in tile definition](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/definition.json#L20)
    * The tile defines an [action endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/routes/actionEndpoint.js) which serves the [modal HTML](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/action.html) and the [JS for closing an issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/javascripts/action.js#L84)
  * JS calls the [endpoint for proxying close issue calls to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66) @ <b>/github/place/changeIssueState</b>
    * [Service controller invokes gitHubFacade to make calls to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143)
    * [gitHubFacade calls to GitHub API to close the issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L158)
  * [GitHub calls service endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28) in response to GitHub issue update @ <b>/github/WebHookPortal</b>
  * [Registered webhook handler is invoked to update the recent issues tile](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L30)

## Issue Discussions

Using a Jive discussion to comment on a GitHub issue

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/discussions1.jpg "Issue Discussions 1")

* **Sequence 8 & 9:** Create GitHub issue --> Create Jive discussion
  * During place config, webhooks are established to model GitHub issues as Jive discussions
    * The [config modal JS calls place setup endpoint] (https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L291) to trigger webhooks setup
    * The [endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22) and its [controller kicks off GitHub and Jive webhooks setup](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L80) @ <b>/github4jive/place/trigger</b>
  * The [GitHub webhooks setup code defines an issue handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookBuilder.js#L30)
    * [The handler calls jive to create discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L51) when triggered by an incoming GitHub event @ <b>[jiveURL]/api/core/v3/contents</b>
    * [The handler calls Jive to write ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L107) linking the discussion to a GitHub issue
      * [The jiveApiFacade is used to make the actual call](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L229) @ <b>[jiveURL]/api/core/v3/contents/[contentID]/extProps</b>

* **Sequence 10 & 11: Comment GitHub issue --> Jive Discussion reply**
  * [GitHub calls service webhook endoint, forwards to controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28)
  * [Controller forwards GitHub event to GitHubFacade for processing](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
  * [GitHubFacade invokes registered event handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
  * [Place issue comment handler is invoked](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L42)
  * [Issue handler queries Jive for related discussion via ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/helpers.js#L18)
  * [Issue handler creates a reply based on issue comment] (https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L66)
  * [Issue handler uses Jive api facade to create discussion reply](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L208)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/discussions2.jpg "Issue Discussions 2")

* **Sequence 12: Jive Discussion reply --> Comment on GitHub issue**
  * [Registered Jive service webhook](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L107) 
  * [Jive invokes service webhook endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js#L27)
  * [Endpoint delegates to controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveController.js#L30)
  * [Controller forwards reply event to webhook processor, determines its a discussion reply, delegates to issue comment handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/webhookBuilder.js#L74)
  * [Discussion Reply handler fetches jive discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L38)
  * [Discussion Reply handler fetches discussion ext props to locate linked github issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L47)
  * [Discussion Reply handler uses GitHub facade to post a new comment on the issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L59)
  * [GitHub facade posts a new issue comment](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L191)

## Issue Actions

Using Jive app actions to manage GitHub issues 

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/actions1.jpg "Issue Actions 1")

* **Sequence 13: State-aware app actions**
  * [App location](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/apps/GitHub4Jive/public)
  * [Discussion app action definitions](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/apps/GitHub4Jive/public/app.xml#L59)
  * [Discussion ext properties are set](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L107)
  * [App action contribution reference](https://community.jivesoftware.com/docs/DOC-114464)

* **Sequence 14: TBD**
  * [Jive calls service webhook endpoint]()
  * [Service endpoint calls GitHub to close issue]()
  * [GitHub calls service webhook endpoint]()
  * [Discussion ext properties are set, indicating closure](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L123)
