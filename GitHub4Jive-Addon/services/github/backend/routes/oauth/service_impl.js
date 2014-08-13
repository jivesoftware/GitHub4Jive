var url = require('url');
var util = require('util');
var jive = require('jive-sdk');
var mustache = require('mustache');

var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');

var myOauth = Object.create(sdkInstance);

module.exports = myOauth;

var tokenStore = require("../../../../../common/PlaceStore");

var errorResponse = function( res, code, error ){
    res.status(code);
    res.set({'Content-Type': 'application/json'});
    var err = {'error': error};
    res.send(JSON.stringify(err));
    responseSent = true;
    jive.logger.debug(err);
};

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

myOauth.fetchOAuth2Conf = function() {
    jive.logger.debug("fetchOAuth2Conf ...");
    return jive.service.options['github']['oauth2'];
};


myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    jive.logger.debug("oauth2SuccessCallback ...");
    jive.logger.debug('State', state);
    jive.logger.debug('GitHub Response: ', originServerAccessTokenResponse['entity']);

    state = JSON.parse(state);
    var placeRef = state.context.place;

    var toStore = {"github": {
      userID : state['viewerID'],
      token: originServerAccessTokenResponse['entity']
    }};



    tokenStore.saveToken( placeRef, toStore).then( function() {
        callback(context);
    });
};


/**
 * <h4><i>POST /github/oauth2Callback</i></h4>
 * <br>
 * Expects:
 * - code
 * - state, which is a base64 encoded JSON structure containing at minimum jiveRedirectUrl attribute
 * @param req
 * @param res
 */
myOauth.oauth2Callback = function(req, res ) {
    jive.logger.debug("oauth2Callback ...");
  
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var code = query['code'];
    if ( !code ) {
        errorResponse( res, 400, 'Authorization code required');
        return;
    }

    var stateStr = query['state'];
    if ( !stateStr ) {
        errorResponse( res, 400, 'Missing state string');
        return;
    }
  
    try {
        var state =  JSON.parse( jive.util.base64Decode(stateStr));
    } catch ( e ) {
      errorResponse( res, 400, 'Invalid state string, cannot parse.');
        return;
    }
  
  var oauth2Conf = myOauth.fetchOAuth2Conf();
  var postObject = myOauth.buildOauth2CallbackObject( oauth2Conf, code, oauth2Conf['oauth2CallbackExtraParams'] );
  jive.logger.debug("Post object", postObject);
  
  var headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept' : 'application/json' };

  var proceed = function(context, error) {
      jive.logger.debug("proceed ...");
    
      if (error) {
        jive.logger.debug("proceed error");
        errorResponse(res, 500, error);
        return;
      }
      res.status(200);
//      res.set({'Content-Type': 'application/json'});
//      res.send(context);
      res.render('oauth-callback.html',context);
  };
  
  var oauth2SuccessCallback = myOauth.oauth2SuccessCallback;

  jive.util.buildRequest( oauth2Conf['originServerTokenRequestUrl'], 'POST', postObject, headers).then(
    function(response) {
      // success
      if ( response.statusCode >= 200 && response.statusCode < 299 ) {
        if (oauth2SuccessCallback) {
          oauth2SuccessCallback( state, response, proceed );
        } else {
          proceed({},"unsuccessful call");
        }
      } else {
        res.status(response.statusCode);
        res.set({'Content-Type': 'application/json'});
        res.send(response.entity);
      }
    },
    function(e) {
      // failure
      errorResponse( res, 500, e);
    }
  ).catch(function(e){
    errorResponse(res,500,e);
  });
  

};

// note:  changes merged into core jive-sdk on GitHub, when cutting new version...remove this method.
/**
 * @param oauth2Conf
 * @param callback
 * @param context
 * @param extraAuthParams
 */
myOauth.buildAuthorizeUrlResponseMap = function (oauth2Conf, callback, context, extraAuthParams) {
    jive.logger.debug("buildAuthorizeUrlResponseMap ...");
  
    var redirectUri = oauth2Conf['clientOAuth2CallbackUrl'];
  
    if (redirectUri.substring(0,1) == "/") {
       redirectUri = jive.service.serviceURL() + redirectUri;
    } // end if
    
    jive.logger.debug(JSON.stringify(context));
  
    var url = oauth2Conf['originServerAuthorizationUrl'] + "?" +
        "state=" + jive.util.base64Encode(JSON.stringify(context)) +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&client_id=" + oauth2Conf['oauth2ConsumerKey'] +
        "&response_type=" + "code";
  
    if (oauth2Conf['oauth2Scope']) {
        url += "&scope=" + encodeURIComponent(oauth2Conf['oauth2Scope']);
    } // end if

    if (extraAuthParams) {
        var extraAuthStr = '';
        for (var key in extraAuthParams) {
            if (extraAuthParams.hasOwnProperty(key)) {
                extraAuthStr += '&' + key + '=' + extraAuthParams[key];
            }
        }

        url += extraAuthStr;
    }
  
    jive.logger.debug('\t url='+url);

    return {
        'url': url
    };
};

// note:  changes merged into core jive-sdk on GitHub, when cutting new version...remove this method.
myOauth.buildOauth2CallbackObject = function (oauth2Conf, code, extraParams) {
   
  //changes merged into core jive-sdk, 
  var redirectUri = oauth2Conf['clientOAuth2CallbackUrl'];
  
    if (redirectUri.substring(0,1) == "/") {
       redirectUri = jive.service.serviceURL() + redirectUri;
    } // end if
  
    var postObject = {
        'grant_type': 'authorization_code',
        'redirect_uri': redirectUri,
        'client_id': oauth2Conf['oauth2ConsumerKey'],
        'client_secret': oauth2Conf['oauth2ConsumerSecret'],
        'code': code
    };

    if (extraParams) {
        postObject = util._extend(postObject, extraParams);
    }

    return postObject;
};

myOauth.getTokenStore = function() {
    return tokenStore;
};

