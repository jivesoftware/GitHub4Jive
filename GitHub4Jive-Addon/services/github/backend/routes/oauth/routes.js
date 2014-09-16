var service = require('./service_impl.js');

/**
 * These are required routes to handle the basicOauthFlow.js process.
 */

exports.authorizeUrl = {
    'path' : '/github/oauth/authorize',
    'verb' : 'get',
    'jiveLocked' : true,
    'route': service.authorizeUrl.bind(service)
};

/**
 * This callback is called after GitHub has received the authorization from the user.
 * The oauth token is stored here.
 */

exports.oauth2Callback = {
    'path' : '/github/oauth/callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};