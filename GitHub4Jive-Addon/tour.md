<h1>Place configuration</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon">GitHub4Jive/blob/master/GitHub4Jive-Addon - Service structure</a>
   </li>
   <li>  
      <a href='https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/configuration.html'>GitHub4Jive-Addon/public/configuration.html - Config modal HTML</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/public/javascripts/configurePlace.js#L199">GitHub4Jive-Addon/public/javascripts/configurePlace.js - Config modal JS</a> 
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L102">GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js - Endpoint for capturing GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js#L42">GitHub4Jive-Addon/services/github/backend/gitHubOAuthController.js - Logic for storing GitHub access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js">GitHub4Jive-Addon/services/jive/backend/routes/jiveEndpoints.js - Endpoint for capturing Jive access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js">GitHub4Jive-Addon/services/jive/backend/jiveOAuthController.js - Logic for storing Jive access token</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js#L22">GitHub4Jive-Addon/services/places/backend/routes/placeEndpoints.js - Endpoint for triggering place webhook setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/placeController.js#L80">GitHub4Jive-Addon/services/places/backend/placeController.js - Kick off webhook setup</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/webhookProcessor.js">GitHub4Jive-Addon/services/places/backend/webhooks/webhookProcessor.js - GitHub webhook processor - setting up</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js - Github Webhook processor - Issue Handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js">GitHub4Jive-Addon/services/places/backend/webhooks/issueHandler.js - Github Webhook processor - Issue Comment Handler</a>
   </li>
</ul>
</p>

<h1>Tile instance registration</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles">GitHub4Jive/tree/master/GitHub4Jive-Addon/tiles - Tiles home</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js#L54">GitHub4Jive-Addon/tiles/github-issues-recent/backend/controller.js - Recent issues tile registration handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookProcessor.js">GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/webhookProcessor.js - Recent issues tile - setup github webhook processor</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js">GitHub4Jive-Addon/tiles/github-issues-recent/backend/webhooks/issueHandler.js - Recent issues tile - github issue state change handler</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js">GitHub4Jive-Addon/tiles/github-issues-recent/backend/tileInstanceProcessor.js - Recent issues tile - recent issues datapush</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L125">GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js - Use gitHubFacade to fetch most recent repo issues from GitHub</a> 
   </li>
</ul>
</p>

<h1>Update tiles on GitHub issue creation</h1>
<p>
<ul>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js#L28">GitHub4Jive-Addon/services/github/backend/routes/gitHubEndpoints.js - Service endpoint called by GitHub</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/services/github/backend/gitHubController.js#L40">GitHub4Jive-Addon/services/github/backend/gitHubController.js - Forward to GitHub facade to find event handlers</a>
   </li>
   <li>
      <a href="https://github.com/jivesoftware/GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js#L306">GitHub4Jive/blob/master/GitHub4Jive-Addon/lib/github4jive/gitHubFacade.js - Execute registered event handlers</a>
   </li>
</ul>
</p>
