var jive = require('jive-sdk');

var myOauth = Object.create(jive.service.routes.oauth);
module.exports = myOauth;

var tokenStore = jive.service.persistence();

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

myOauth.fetchOAuth2Conf = function() {
    var oauthConf = jive.service.options['oauth2-github'] || {};
    oauthConf = JSON.parse( JSON.stringify( oauthConf ) );
    var clientOAuth2CallbackUrl = oauthConf[ 'clientOAuth2CallbackUrl' ];
    oauthConf[ 'clientOAuth2CallbackUrl' ] =
        clientOAuth2CallbackUrl || jive.service.serviceURL() + '/example-github/oauth/oauth2Callback';
    return oauthConf;
};

myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    console.log('State', state);
    console.log('originServerAccessTokenResponse', originServerAccessTokenResponse);

    // response from GITHUB is  'access_token=XXXXXXXXX&token_type=bearer'
    var body=originServerAccessTokenResponse.entity.body.toString();
    var idx=body.search("&") ;
    var accessToken = body.substring(13,idx)  ; // just grab the access_token part of the the response
    tokenStore.save('tokens', state['viewerID'], {
        ticket : state['viewerID'],
        accessToken: accessToken
    }).then( function() {
        callback({'ticket': state['viewerID'] });
    });
};

myOauth.getTokenStore = function() {
    return tokenStore;
};

myOauth.getOauthToken = function(ticketID){
    return tokenStore.find('tokens', {'ticket': ticketID }).then( function(found) {
        if (found[0] != undefined) {
            var accessToken = found[0]['accessToken'];
            return {"type": "oauth", "token": accessToken};
        }else {
            throw Error("No token record found for ticket ID=" + ticketID);
        }
    });
}
