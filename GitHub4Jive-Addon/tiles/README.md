GitHub for Jive - Developer Notes
=================================

Tiles will need to be made to display relevant information about Commits, Issues, and Pull Requests.
Each of these types will need a tile to display recent or important information and an activity tile 
to display information in a places activity stream as it occurs.

The Commit tile should display the top 5 most recent commits in an accordion and the files changed in each of those
commits. These should at the very least link to GitHub and if other functionality is added then this 
should still be available. Commit would go to commit page, changed files would go to diff page of that
file. Even better would be to show the diff on page instead of going all the way to GitHub.

The Issue tile should display a the most recent issue state changes. Each issue should link to a discussion in
Jive that revolved around that issue. It should link to issue page on GitBub if it can't find a jive discussion.
This is likely if GitHub synchronization is turned off.

The Pull Request tile should display the most recent requests based on modification. These should link to their Jive
discussion if it exists. There should be a way to see all pull requests in the canvas app from this tile. 

For each type anytime one of them is created, modified, or deleted on GitHub there should be an activity feed entry.
If one of these types is specifically referenced outside of it's discussion then an activity stream entry should be created.
In addition, if GitHub synchronization is turned off then whenever a Jive discussion related to one of these objects 
is created, modified or deleted it should show in the activity feed. Otherwise, there would be entries that are basically
the same in the activity stream.

Finally, a gauge tile should be created to somehow show project health. It should be based on GitHub stats and/or Jive analytics


User Stories
============

As a any Jive User with access to the place linked to a GitHub repository:
<ol>
    <li>I should be able to see the most recent commits that have occurred on the linked repository.
        <ul>
            <li>Each commit should be able to take me back to its GitHub page.</li>
            <li>Each commit should show me the changes that occurred in that commit.</li>
            <li>I should be able to see the diff of the files, either one by one or all at once. It would be nice to see it in Jive.</li>
        </ul>
    </li>
    <li>I should be able to see the most recent issues for the linked repository.
        <ul>
            <li>Each issue should be Linked to GitHub.</li>
            <li>Each issue should be linked to its Jive Discussion if it exists.</li>
        </ul>
    </li>
    <li>
        I should be able to see new, updated, or deleted Commits, Issues, and Pull Requests in the Activity stream for the place.
    </li>
</ol>

As a GitHub Contributor:
<ol>
    <li>I should be able to see Issues that I have commented on. Above others, unless it has been closed or otherwise inactive. 
    In other words, it should not hide new issues by showing old Issues that I don't need to see anymore.</li>
    <li>I should be able to see my most recent pull requests and what state they are in.
        <ul>
            <li>Linked to GitHub page.</li>
            <li>Linked to Jive Discussion if it exists.</li>
        </ul>
    </li>
</ol>

As a Repository owner/admin:
<ol>
    <li>I should be able to see the most recent Pull Requests by modification date.
        <ul>
            <li>It should link to GitHub.</li>
            <li>It should link to a Jive discussion if it exists.</li>
        </ul>
    </li>
</ol>


Tile Configuration Guidelines:
=============================

If the tile does not need additional configuration beyond attaching to a place and getting its 
repository than add "config": "/github4jive/basicTileConfig" to its definition.json and it will 
be configured along with all other basic tiles. No further work is necessary.

<p>Use the configurePlace.js file from the root public javascripts directory.
Tile configuration should include the following html to authenticate and configure the repository.</p>
<code>
```html
<div id="j-card-authentication" class="j-card" >
     <p>The remote systems (Jive &amp; GitHub) require you to grant access before proceeding.</p>
     <div>
        <a id="github4jive-jive-authorize" href="javascript:void(0);" style="display: none;">Authorize Jive</a>
        <div id="github4jive-jive-authorize-success" style="display: none;">
            <span>Jive Authorized - OK</span>
        </div>
     </div>
     <br/>
     <div>
        <a id="github4jive-github-authorize" href="javascript:void(0);" style="display: none;">Authorize GitHub</a>
        <div id="github4jive-github-authorize-success" style="display: none;">
            <span>GitHub Authorized - OK</span>
        </div>
     </div>
 </div>

 <div id="j-card-configuration" class="j-card" style="display: none;">
     <br/>
     <div class="form-group">
        <label for="projectList">Repository: </label>
        <div class="bootstrap-select-overlay">
            <span id="loader" ><span></span></span><select id="projectList" class="form-control"></select>
        </div>
     </div>
     <div class="form-group">
        <input id="github4jive-enable-submit" type="button" value="Save" class="btn btn-primary"/>
     </div>
 </div>
```
</code>

This is the bare minimum to allow a tile to configure the place it is on for Github4Jive. Because basicOauthFlow
can be used in apps as well it does not handle closing of the tile/app. It instead emits an event "github4jiveConfigDone"
when it has finished its configuration. Use this event to then do any additional configuration required for the tile
and then close it. DO NOT close the tile by listening for github4jive-enable-submit click. This will cancel requests that
are in progress that will break the basicOauthFlow configuration.

The configurePlace.js also emits "github4jiveAuthorized" when it has passed the authorization phase.  Use this event to
initialize any elements that require querying GitHub or Jive. The repository list is automatically populated.
The j-card-configuration and j-card-action panels will be unhidden automatically if they are present when this event
is triggered.

