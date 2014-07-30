var url = require('url');
var util = require('util');
var jive = require('jive-sdk');
var mustache = require('mustache');

var sdkInstance = require('jive-sdk/jive-sdk-service/routes/oauth');

var myOauth = Object.create(sdkInstance);

module.exports = myOauth;

var tokenStore = jive.service.persistence();

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
    jive.logger.debug("Retreiving GitHub OAuth2 Configuration...");
    return jive.service.options['github']['oauth2'];
};


myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    jive.logger.debug('State', state);
    jive.logger.debug('GitHub Response: ', originServerAccessTokenResponse['entity']);
  
    var context = {
      userID : state['viewerID'],
      token: originServerAccessTokenResponse['entity']
    };
  
    tokenStore.save('gitHubAccessTokens', 
                    state['viewerID'], context)
    .then( function() {
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
    jive.logger.debug("overridden oauth2Callback ...");
  
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

      var redirectHtml = mustache.render(myOauth.redirectHtmlTxt, context);
    
      jive.logger.debug(redirectHtml);

      res.status(200);
      res.set({'Content-Type': 'text/html'});
      res.send(redirectHtml);
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

myOauth.redirectHtmlTxt = "<html> <head> <body> <p> <strong>userID</strong> : {{{userID}}}<br/><strong>accessToken</strong>: {{{token.access_token}}}</p><p>TODO: NEED TO DO A NICE CLEAN POST-TOKEN REDIRECT ... see: gitHubAccessTokens for token details </p> </body> </html>";

/**
 * @param oauth2Conf
 * @param callback
 * @param context
 * @param extraAuthParams
 */
myOauth.buildAuthorizeUrlResponseMap = function (oauth2Conf, callback, context, extraAuthParams) {
    jive.logger.debug("overridden buildAuthorizeUrlResponseMap ...");

    var url = oauth2Conf['originServerAuthorizationUrl'] + "?" +
        "state=" + jive.util.base64Encode(JSON.stringify({ "viewerID" : 1234})) +
        "&redirect_uri=" + encodeURIComponent(oauth2Conf['clientOAuth2CallbackUrl']) +
        "&client_id=" + oauth2Conf['oauth2ConsumerKey'] +
        "&response_type=" + "code" +
        "&scope=user,public_repo";

    if (extraAuthParams) {
        var extraAuthStr = '';
        for (var key in extraAuthParams) {
            if (extraAuthParams.hasOwnProperty(key)) {
                extraAuthStr += '&' + key + '=' + extraAuthParams[key];
            }
        }

        url += extraAuthStr;
    }

    return {
        'url': url
    };
};

myOauth.getTokenStore = function() {
    return tokenStore;
};

