# GitHub4Jive Sequences and Code Refs

## Issue Management

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues1.jpg "Issue Management 1")

* **Sequence 1 Code:** Capture GitHub access tokens
  * [Service structure](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon)
  * [Invoke config modal HTML (front end)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html)
  * [Config JS launches 3-legged OAuth with Jive + GitHub (front end)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199)
  * [Browser invokes service endpoint for capturing GitHub access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L102)
  * [Service stores GitHub access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42)
  * [Browser invokes service endpoint for capturing Jive access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js)
  * [Service stores Jive access token](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js)

* **Sequence 2 Code:** Jive tile registration --> setup GitHub webhooks
  * [Tiles home](https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles)
  * [Service handles tile registration call from Jive](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L54)
  *  [Tile registration handler sets up GitHub webhook processor](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookProcessor.js)
  * [GitHub issue state change webhook handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js)
  *  [Subscribing to GitHub repo event](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L211)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues2.jpg "Issue Management 2")

* **Sequence 3 Code:** Create GitHub issue --> Update Jive tiles
  * [Service endpoint called by GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28)
  * [Forward to GitHub facade to find event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
  * [Execute registered event handlers](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
  * [Execute Recent Issues tile datapush handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js#L38)
  * [Recent issues are pushed to Jive](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js)
  * [Using gitHubFacade to fetch most recent repo issues from GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L125)
  
![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/issues3.jpg "Issue Management 3")

* **Sequence 4 & 5 Code:** Close GitHub issue via tile action --> update Jive tiles
  * [Define tile action context as part of tile push](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L77)
  * [Define the tile entry action route (powers the modal)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/routes/action/get.js)
  * [Tile entry action modal UI (front end)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/action.html)
  * [Tile entry action modal JS - close an issue (front end)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/javascripts/action.js#L84)
  * [Invoke endpoint for proxying close issue calls to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66)
  * [Service performs close issue proxy call to GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143)
  * [Github facade call to GitHub for close issue operation](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L158)
  * [Update recent issues tile when webhook postback URL is called by GitHub](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js)

## Issue Discussions

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/discussions1.jpg "Issue Discussions 1")

* **Sequence 6 & 7 Code:** Create GitHub issue --> Create Jive discussion
  * [Config modal JS calls place setup endpoint (front end)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L255)
  * [Endpoint for triggering place setup](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22)
  * [Kick off GitHub and Jive webhooks setup](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L80)
  * [GitHub webhook processor defines an issue handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookProcessor.js)
  * [Issue Handler creates a Jive discussion when invoked on GitHub issue creation](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L51)
  *  [Create a Jive discussion entity](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveContentBuilder.js#L88)
  *  [Create extended props for Jive discussion (binding it to remote GitHub issue)](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L70)
  * [Call Jive to add extended props to Jive discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L229)
  * [Invoke Jive APIs using access token, refresh if necessary](https://github.com/jivesoftware/jive-sdk/blob/master/jive-sdk-api/lib/community/community.js#L226)

* **Sequence 8 & 9 Code: Comment GitHub issue --> Jive Discussion reply**
  * [GitHub calls service webhook endoint, forwards to controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28)
  * [Controller forwards GitHub event to GitHubFacade for processing](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40)
  * [GitHubFacade invokes registered event handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306)
  * [Place issue comment handler is invoked](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L42)
  * [Issue handler queries Jive for related discussion via ext props](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/helpers.js#L18)
  * [Issue handler creates a reply based on issue comment] (https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueCommentHandler.js#L66)
  * [Issue handler uses Jive api facade to create discussion reply](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L208)

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/discussions2.jpg "Issue Discussions 2")

* **Sequence 10 Code: Jive Discussion reply --> Comment on GitHub issue**
  * [Registered Jive service webhook](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L107) 
  * [Jive invokes service webhook endpoint](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js#L27)
  * [Endpoint delegates to controller](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveController.js#L30)
  * [Controller forwards reply event to webhook processor, determines its a discussion reply, delegates to issue comment handler](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/webhookProcessor.js#L74)
  * [Discussion Reply handler fetches jive discussion](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L38)
  * [Discussion Reply handler fetches discussion ext props to locate linked github issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L47)
  * [Discussion Reply handler uses GitHub facade to post a new comment on the issue](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/webhooks/jiveCommentHandler.js#L59)
  * [GitHub facade posts a new issue comment](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L191)

## Issue Actions

![](https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/images/actions1.jpg "Issue Actions 1")

* **Sequence 11 Code: TBD**
  * TBD
  * TBD
  * TBD
  * TBD

* **Sequence 12 Code: TBD**
  * TBD
  * TBD
  * TBD
  * TBD
