var place, previousRepo;
var jiveDone = false;
var githubDone = false;




function AllAuthorized() {
    $("#j-card-authentication").hide();
    $("#j-card-configuration").show();
    gadgets.window.adjustHeight(350);  // do this here in case the pre-auth callback above wasn't called

    // set up a query to get this user's list of repositories
    osapi.http.get({
        'href': host + '/github/user/repos?' +
            "&ts=" + new Date().getTime() +
            "&place=" + encodeURIComponent(place.resources.self.ref),
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
        console.log("onLoadCallback");
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
        context: {"place": place.resources.self.ref}
    }).launch({'viewerID': viewerID});
}

var app = {

    currentView: gadgets.views.getCurrentView().getName(),
    currentViewerID: -1,
    initGadget: function () {
        console.log('initGadget ...');

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

        jive.tile.onOpen(function(config, options ) {
            gadgets.window.adjustHeight();

            if ( typeof config === "string" ) {
                config = JSON.parse(config);
            }

            var json = config || {
                "startSequence": "1"
            };

            // prepopulate the sequence input dialog
            $("#start_sequence").val( json["startSequence"]);

            $("#btn_submit").click( function() {
                config["startSequence"] = $("#start_sequence").val();
                jive.tile.close(config, {} );
                gadgets.window.adjustHeight(300);
            });
        });
    },

    initjQuery: function () {
        console.log('initjQuery ...');
        gadgets.window.adjustHeight(250);
    },

    handleContext: function (context) {
        console.log('handleContext ...');
        if (context) {

            osapi.jive.corev3.resolveContext(context, function (result) {
                place = result.content;

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
                            "&place=" + encodeURIComponent(place.resources.self.ref),
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
                            }
                        }
                    );

                });

            });

            $("#github4jive-enable-submit").click(function () {
                console.log('Saving GitHub4Jive Repository Information');

                    if (place) {
                        console.log('context has content callback');
                        //TODO: BULLET-PROOF/UN HARD CODE THE LOGIC HERE, REVISIT ONCE THE FLOW IS BETTER BAKED - RR
                        var fullName = $("#projectList option:selected").text();
                        var parts = fullName.split("/");
                        var owner = parts[0];
                        var repoName = parts[1];

                        result.content.createExtProps({
                            "github4jiveEnabled": true,
                            "github4jiveRepo": repoName,
                            "github4jiveRepoOwner": owner
                        }).execute(function (resp) {
                            console.log('resp: {' + JSON.stringify(resp) + '}');
                            osapi.http.post({
                                'href': host + "/github/place/trigger?" +
                                    "&place=" + encodeURIComponent(place.resources.self.ref),
                                'format': 'json',
                                'authz': 'signed'
                            }).execute(function (response) {
                                console.log(response);
                            });
                        });
                    }
                });
        }
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));



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