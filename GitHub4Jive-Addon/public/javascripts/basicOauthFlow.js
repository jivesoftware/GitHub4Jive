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
     <p>
        Repo: <span id="loader"><select id="projectList"></select><span></span></span>
     </p>
     <input id="github4jive-enable-submit" type="button" value="Save" />
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

var placeUrl, previousRepo;
var jiveDone = false;
var githubDone = false;

var host;

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

var onLoadCallback = function (config, identifiers) {
    onLoadContext = {
        config: config,
        identifiers: identifiers
    };
};

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

                if(result.content.contentID){//Content Action.
                    placeUrl = result.content.parentPlace.uri;
                }else{
                    placeUrl = result.content;
                }



                setupOAuthFor("github", function (ticketID) {
                    if (ticketID) {
                        githubDone = true;
                        $('#github4jive-github-authorize').slideUp('fast');
                        $('#github4jive-github-authorize-success').slideDown('fast', ProceedWhenReady);
                    }
                });

                setupOAuthFor("jive", function (ticketID) {
                    if (ticketID) {
                        jiveDone = true;
                        $('#github4jive-jive-authorize').slideUp('fast');
                        $('#github4jive-jive-authorize-success').slideDown('fast', ProceedWhenReady);
                    }
                });

                result.content.getExtProps().execute(function (props) {

                    if ("true" === props.content.github4jiveEnabled) {//&& props.content.github4jiveGitHubAccessToken && props.content.github4jiveJiveAccessToken) {
                        console.log('initializing UI for already configured place');
                        previousRepo = props.content.github4jiveRepoOwner + "/" + props.content.github4jiveRepo;
                    } else {
                        console.log('initializing UI for UNconfigured place');
                    }

                    //double check server side configuration with ext props
                    osapi.http.get({
                        'href': host + '/jive/place/isConfigured?' +
                            "&ts=" + new Date().getTime() +
                            "&place=" + encodeURIComponent(placeUrl),
                        //"&query=" + query,
                        'format': 'json',
                        'authz': 'signed'
                    }).execute(function (response) {
                            var config = response.content;
                            githubDone = config.github;
                            jiveDone = config.jive;

                            if (BothAreDone()) {
                                AllAuthorized();
                            } else {
                                if (config.github) {
                                    $('#github4jive-github-authorize-success').slideDown('fast', function () {
                                    });
                                }
                                else {
                                    $('#github4jive-github-authorize').slideDown('fast', function () {
                                    });
                                }

                                if (config.jive) {
                                    $('#github4jive-jive-authorize-success').slideDown('fast', function () {
                                    });
                                }
                                else {
                                    $('#github4jive-jive-authorize').slideDown('fast', function () {
                                    });
                                }
                                gadgets.window.adjustHeight();
                            }
                        }
                    );

                });

            });

            $("#github4jive-enable-submit").click(function () {
                console.log('Saving GitHub4Jive Repository Information');

                console.log('context has content callback');
                //TODO: BULLET-PROOF/UN HARD CODE THE LOGIC HERE, REVISIT ONCE THE FLOW IS BETTER BAKED - RR
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
                        'href': host + "/github/place/trigger?" +
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
        id: "com.jivesoftware.addon.github4jive.discussion.modifyIssue",
        callback: app.handleContext
    });
}