var app = {
  currentView : gadgets.views.getCurrentView().getName(),

  initGadget : function() {
    console.log('initGadget called...');
        
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
  
  initjQuery : function(host) {
    console.log('initjQuery called: ',host);
    
    var options = {
        serviceHost : host,
        grantDOMElementID : '#oauth',
        jiveAuthorizeUrlErrorCallback : app.jiveAuthorizeUrlErrorCallback,
        oauth2SuccessCallback : app.oauth2SuccessCallback,
        preOauth2DanceCallback : app.preOauth2DanceCallback,
        onLoadCallback : app.onLoadCallback,
        authorizeUrl : host + '/github/oauth/authorize'
    };
    
    $("#btn_done").click( function() {
        console.log(onLoadContext);
    });
    
    OAuth2ServerFlow( options ).launch();
    
  },
  
  tokenErrorCallback : function() {
    alert('tokenErrorCallback error');
  },
  
  jiveAuthorizeUrlErrorCallback : function() {
    alert('jiveAuthorizeUrlErrorCallback error');
  },
  
  preOauth2DanceCallback : function() {
    $("#j-card-authentication").show();
    $("#j-card-configuration").hide();
    gadgets.window.adjustHeight(350);
  },

  onLoadCallback : function( config, identifiers ) {
    onLoadContext = {
        config: config,
        identifiers : identifiers
    };
  },

  oauth2SuccessCallback : function(accessToken) {
    console.log('accessToken:',accessToken);

    // do configuration
    $("#j-card-authentication").hide();
    $("#j-card-configuration").show();
    gadgets.window.adjustHeight(350);  // do this here in case the pre-auth callback above wasn't called

    //debugger;
    var identifiers = jive.tile.getIdentifiers();
    var viewerID = identifiers['viewer'];   // user ID
    
/* SAMPLE RESPONSE
    [
      {
        "id": 1296269,
        "owner": {
          "login": "octocat",
          "id": 1,
          "avatar_url": "https://github.com/images/error/octocat_happy.gif",
          "gravatar_id": "somehexcode",
          "url": "https://api.github.com/users/octocat",
          "html_url": "https://github.com/octocat",
          "followers_url": "https://api.github.com/users/octocat/followers",
          "following_url": "https://api.github.com/users/octocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
          "organizations_url": "https://api.github.com/users/octocat/orgs",
          "repos_url": "https://api.github.com/users/octocat/repos",
          "events_url": "https://api.github.com/users/octocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/octocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "name": "Hello-World",
        "full_name": "octocat/Hello-World",
        "description": "This your first repo!",
        "private": false,
        "fork": false,
        "url": "https://api.github.com/repos/octocat/Hello-World",
        "html_url": "https://github.com/octocat/Hello-World"
      }
    ]
*/  
    osapi.http.get({
      href: 'https://api.github.com/repositories',
      format: 'json',
      headers: {  'Authorization' : 'token ' + accessToken  },
      noCache: true,
      authz: 'signed'
    }).execute(function( response ) {
      console.log('Received GitHub Response:',response.status);

      var config = onLoadContext['config'];

      if ( response.status >= 400 && response.status <= 599 ) {
        alert("ERROR!" + JSON.stringify(response.content));
      } // end if
      
      var data = response.content;
      console.log(data);

      // could use a forEach or something here ...
      $.each(data,function(index,repo) {
        $("#repoList").append(
          "<option value=\"" + repo.id +  "\"" +
          ((repo.name == config['repo']) ? " " : " selected ") +
          "data-url=\""+repo.url+"\"" + 
          "data-description=\""+repo.description+"\"" + 
          ">" + repo.full_name +"</option>"
        );
      }); // end for

      $("#btn_submit").click( function() {

       var toReturn = {
          "repo" : $("#repoList option:selected").text(),
          "id"   : $("#repoList option:selected").val(),
          "url"  : $("#repoList option:selected").attr('data-url'),
          "description" : $("#repoList option:selected").attr('data-description'),
          "isGitHub" : true
        };
        
       console.log("toReturn", toReturn);
        
       jive.tile.close(toReturn);
      });
    });

    gadgets.window.adjustHeight();
  }

};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));