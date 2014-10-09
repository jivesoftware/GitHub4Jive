<h1>Capture Jive and GitHub access tokens</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon">Service structure</a>
   </li>
   <li>  
      <a href='https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html'>(Front End) Config modal HTML</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199">(Front End) Config modal JS</a> 
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L102">Endpoint for capturing GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42">Logic for storing GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js">Endpoint for capturing Jive access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js">Logic for storing Jive access token</a>
   </li>
</ul>
</p>

<h1>Jive tile registration + GitHub webhooks setup</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles">Tiles home</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L54">Recent issues tile registration handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookProcessor.js">Recent issues tile - setup github webhook processor</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js">Recent issues tile - github issue state change handler</a>
   </li>
   
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L211">Subscribe to github repo event</a>
   </li>

</ul>
</p>

<h1>Update Jive tiles on GitHub issue create</h1>
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
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js">Recent issues datapush</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L125">Use gitHubFacade to fetch most recent repo issues from GitHub</a> 
   </li>
   
</ul>
</p>

<h1>Update Jive tiles on GitHub issue close</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js#L77">Push tile entry action context (in tileInstanceProcessor)</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/routes/action/get.js">Define tile entry action route</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/action.html">(Front End) - Tile entry action modal UI</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/public/javascripts/action.js#L84">(Front End) Tile entry action modal JS - close an issue</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L66">Endpoint for proxying close issue call to GitHub</a>
   </li>

   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L143">Controller which performs close issue proxy call to GitHub</a>
   </li>
   
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L158">Github facade call to GitHub for close issue operation</a>
   </li>
   
   <li>
      <a href=""></a>
   </li>
   
   
</ul>
</p>

<h1>Place configuration</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon">Service structure</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199">Config modal JS</a> 
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22">Endpoint for triggering place webhook setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L80">Kick off webhook setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookProcessor.js">GitHub webhook processor - setting up</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">Github Webhook processor - Issue Handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">Github Webhook processor - Issue Comment Handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">Recent Issues tile datapush handler is invoked by GitHub on issue close</a>
   </li>
</ul>
</p>
