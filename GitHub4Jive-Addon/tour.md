<h1>Capture Jive and GitHub access tokens</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon">Service structure</a>
   </li>
   <li>  
      <a href='https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html'>(Front End) Invoke config modal HTML</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199">(Front End) Config JS launches 3-legged OAuth with Jive + GitHub</a> 
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L102">Browser invokes service endpoint for capturing GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42">Service stores GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js">Browser invokes service endpoint for capturing Jive access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js">Service stores Jive access token</a>
   </li>
</ul>
</p>

<h1>Jive tile registration -> Setup GitHub webhooks</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles">Tiles home</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L54">Service handles tile registration call from Jive</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookProcessor.js">Tile registration handler sets up github webhook processor</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js">The GitHub issue state change webhook handler</a>
   </li>
   
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L211">Subscribing to GitHub repo event</a>
   </li>

</ul>
</p>

<h1>Create GitHub issue -> Update Jive tiles</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28">Service endpoint called by GitHub</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40">Forward to GitHub facade to find event handlers</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306">Execute registered event handlers</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">Execute Recent Issues tile datapush handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js">Recent issues are pushed to Jive</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L125">Using gitHubFacade to fetch most recent repo issues from GitHub</a> 
   </li>
   
</ul>
</p>

<h1>Close GitHub issue via Tile Action -> Update Jive Tiles</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L77">Define tile action context as part of tile push</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/routes/action/get.js">Define the tile entry action route (powers the modal)</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/action.html">(Front End) - Tile entry action modal UI</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/javascripts/action.js#L84">(Front End) Tile entry action modal JS - close an issue</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66">Invoke endpoint for proxying close issue calls to GitHub</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143">Service performs close issue proxy call to GitHub</a>
   </li>
   
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L158">Github facade call to GitHub for close issue operation</a>
   </li>
   
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">Update recent issues tile when webhook postback URL is called by GitHub</a>
   </li>   
   
</ul>
</p>

<h1>Create GitHub issue -> Create Jive discussion</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L255">(Front End) Config modal JS calls place setup endpoint</a> 
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22">Endpoint for triggering place setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L80">Kick off GitHub and Jive webhooks setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookProcessor.js">GitHub webhook processor defines an issue handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L51">Issue Handler creates a Jive discussion when invoked on GitHub issue creation</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveContentBuilder.js#L88">Create a Jive discussion entity</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js#L70">Create extended props for Jive discussion (binding it to remote GitHub issue)</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/JiveApiFacade.js#L229">Call Jive to add extended props to Jive discussion</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/jive-sdk/blob/master/jive-sdk-api/lib/community/community.js#L226">Invoke Jive APIs using access token, refresh if necessary</a>
   </li>
   <li>
      <a href=""></a>
   </li>
   <li>
      <a href=""></a>
   </li>
   
</ul>
</p>

<h1>Comment GitHub issue -> Jive Discussion reply</h1>
<p>
<ul>
   <li>
      <a href=""></a>
   </li>
   <li>
      <a href=""></a>
   </li>
   
</ul>
</p>


