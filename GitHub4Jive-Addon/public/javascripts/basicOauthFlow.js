/*
 * basicOauthFlow.js requires oauth2client.js to provide the Oauth2ServerFlow function
 *
 * The following html is required for basicOAuthFlow to work
 *

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


 This is the bare minimum to allow a tile to configure the place it is on for Github4Jive. Because basicOauthFlow
 can be used in apps as well it does not handle closing of the tile/app. It instead emits an event "github4jiveConfigDone"
 when it has finished its configuration. Use this event to then do any additional configuration required for the tile/app
 and then close it. DO NOT close the tile by listening for github4jive-enable-submit click. This will cancel requests that
 are in progress that will break the basicOauthFlow configuration.

 The basicOauthFlow.js also emits "github4jiveAuthorized" when it has passed the authorization phase.  Use this event to
 initialize any elements that require querying GitHub or Jive. The repository list is automatically populated.
 The j-card-configuration and j-card-action panels will be unhidden automatically if they are present when this event
 is triggered.

 */

var place, placeUrl, placeProps,previousRepo;
var contentObject;
var jiveDone = false;
var githubDone = false;

var host;



$("body").append("<link />")

/*
 * This function is called when both GitHub and Jive have authorized the user.
 * The j-card-configuration id is unhid. And the github4jiveAuthorized Event
 * is thrown for custom configurations to setup their forms. The configuration
 * panel should have a select list with id "projectList" to populate the repository list.
 */
function AllAuthorized() {
    $("#j-card-authentication").hide();
    $("#j-card-configuration").show();
    $("#j-card-action").show();
    $(document).trigger("github4jiveAuthorized");
    gadgets.window.adjustHeight();  // do this here in case the pre-auth callback above wasn't called

    // set up a query to get this user's list of repositories
    $("#loader").addClass("j-loading-big");
    osapi.http.get({
        'href': host + '/github/user/repos?' +
            "&ts=" + new Date().getTime() +
            "&place=" + encodeURIComponent(placeUrl),
        //"&query=" + query,
        'format': 'json',
        'authz': 'signed'
    }).execute(function (response) {

        if (response.status >= 400 && response.status <= 599) {
            alert("ERROR!" + JSON.stringify(response.content));
        }
        var data = response.content;
        for (var i = 0; i < data.length; i++) {
            var opt;
            var name = data[i].fullName;
            if (name === previousRepo) {
                opt = "<option value=" + data[i].name + " selected>" + data[i].fullName + "</option>";
            } else {
                opt = "<option value=" + data[i].name + ">" + data[i].fullName + "</option>";
            }
            $("#projectList").append(opt);
        }
        $("#loader").removeClass("j-loading-big");
    });
}

function BothAreDone() {
    return jiveDone && githubDone;
}

function ProceedWhenReady() {
    if (BothAreDone()) {
        AllAuthorized();
    }
}

/*
 * @param {string} system must be either "jive" or "github"
 * @param {function} successfulCallback the function to call when the Oauth dance completes
 */
function setupOAuthFor(system, successCallBack) {
    var ticketErrorCallback = function () {
        console.log('ticketErrorCallback error');
    };

    var jiveAuthorizeUrlErrorCallback = function () {
        console.log('jiveAuthorizeUrlErrorCallback error');
    };

    var preOauth2DanceCallback = function () {
        console.log("preOauth2DanceCallback");
    };

    var onLoadCallback = function (config, identifiers) {
        onLoadContext = {
            config: config,
            identifiers: identifiers
        };
    };

    var authorizeUrl = host + '/' + system + '/oauth/authorize';
    var viewerID = new Date().getTime();

    OAuth2ServerFlow({
        serviceHost: host,
        grantDOMElementID: '#github4jive-' + system + '-authorize',
        ticketErrorCallback: ticketErrorCallback,
        jiveAuthorizeUrlErrorCallback: jiveAuthorizeUrlErrorCallback,
        oauth2SuccessCallback: successCallBack,
        preOauth2DanceCallback: preOauth2DanceCallback,
        onLoadCallback: onLoadCallback,
        authorizeUrl: authorizeUrl,
        jiveOAuth2Dance: system === "jive",
        context: {"place": placeUrl}
    }).launch({'viewerID': viewerID});
}

function setupGitHubOAuth(){
    setupOAuthFor("github", function (ticketID) {
        if (ticketID) {
            githubDone = true;
            $('#github4jive-github-authorize').slideUp('fast');
            $('#github4jive-github-authorize-success').slideDown('fast', ProceedWhenReady);
        }
    });
}

function setupJiveOauth(){
    setupOAuthFor("jive", function (ticketID) {
        if (ticketID) {
            jiveDone = true;
            $('#github4jive-jive-authorize').slideUp('fast');
            $('#github4jive-jive-authorize-success').slideDown('fast', ProceedWhenReady);
        }
    });
}

var app = {

    currentView: gadgets.views.getCurrentView().getName(),
    currentViewerID: -1,
    initGadget: function () {
        console.log('initGadget ...');

    },


    handleContext: function (context) {
        console.log('handleContext ...');
        if (context) {

            osapi.jive.corev3.resolveContext(context, function (result) {

                if(result.content.contentID){// called from Content Action.
                    contentObject = result.content;
                    placeUrl = result.content.parentPlace.uri;

                }else{
                    place = result.content;
                    placeUrl = result.content.resources.self.ref;
                }

                setupGitHubOAuth();
                setupJiveOauth();

                //This function is used right below it.
                function setupPlaceConfig(p) {

                    place = p;
                    place.getExtProps().execute(function (props) {
                        placeProps = props.content;
                        if ("true" === placeProps.github4jiveEnabled) {
                            console.log('initializing UI for already configured place');
                            previousRepo = placeProps.github4jiveRepoOwner + "/" + placeProps.github4jiveRepo;
                        }
                        else {
                            console.log('initializing UI for UNconfigured place');
                        }

                        //double check server side configuration with ext props
                        osapi.http.get({
                            'href': host + '/github4jive/place/isConfigured?' +
                                "&ts=" + new Date().getTime() +
                                "&place=" + encodeURIComponent(placeUrl),
                            'format': 'json',
                            'authz': 'signed'
                        }).execute(function (response) {
                                var config = response.content;
                                githubDone = config.github;
                                jiveDone = config.jive;

                                //make ui changes based on which systems are configured
                                if (BothAreDone()) {
                                    AllAuthorized();
                                }
                                else {
                                    if (config.github) {
                                        $('#github4jive-github-authorize-success').slideDown('fast');
                                    }
                                    else {
                                        $('#github4jive-github-authorize').slideDown('fast');
                                    }

                                    if (config.jive) {
                                        $('#github4jive-jive-authorize-success').slideDown('fast');
                                    }
                                    else {
                                        $('#github4jive-jive-authorize').slideDown('fast');
                                    }
                                    gadgets.window.adjustHeight();
                                }
                            }
                        );

                    });
                }

                //if place was not picked up from the context resolver then grab it from the url
                if(!place){
                    osapi.jive.corev3.places.get({"uri": placeUrl}).execute(setupPlaceConfig);
                }else{
                    setupPlaceConfig(place);
                }

            });

            $("#github4jive-enable-submit").click(function () {
                console.log('Saving GitHub4Jive Repository Information');

                console.log('context has content callback');
                var fullName = $("#projectList option:selected").text();
                var parts = fullName.split("/");
                var owner = parts[0];
                var repoName = parts[1];
                place.createExtProps({
                    "github4jiveEnabled": true,
                    "github4jiveRepo": repoName,
                    "github4jiveRepoOwner": owner
                }).execute(function (resp) {
                    console.log('resp: {' + JSON.stringify(resp) + '}');
                    osapi.http.post({
                        'href': host + "/github4jive/place/trigger?" +
                            "ts=" + new Date().getTime() +
                            "&place=" + encodeURIComponent(placeUrl),
                        'format': 'json',
                        'authz': 'signed'
                    }).execute(function (response) {
                        console.log(response);
                        $(document).trigger("github4jiveConfigDone");
                    });
                });
            });
        }
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));

//defined in oAuth2Client
if(realTile){


    // register a listener for embedded experience context
    opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function (key) {
        var data = opensocial.data.getDataContext().getDataSet(key);

        var resolverTransform = data.container;
        if(resolverTransform.type == 600){
            resolverTransform.type = "osapi.jive.core.Project";
        }
        if(resolverTransform.type == 700){
            resolverTransform.type = "osapi.jive.core.Group";
        }
        if(resolverTransform.type == 14){
            resolverTransform.type = "osapi.jive.core.Space";
        }
        app.handleContext(resolverTransform);
    });
}else{
    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.group.config",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.project.config",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.space.config",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.group.newIssue",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.project.newIssue",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.space.newIssue",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.discussion.reopenIssue",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.discussion.closeIssue",
        callback: app.handleContext
    });

    gadgets.actions.updateAction({
        id: "com.jivesoftware.addon.github4jive.discussion.changeLabels",
        callback: app.handleContext
    });
}