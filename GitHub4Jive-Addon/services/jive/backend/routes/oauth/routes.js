var service = require('./service_impl.js');

exports.authorizeUrl = {
    'path' : '/jive/oauth/authorize',
    'verb' : 'get',
    'jiveLocked' : true,
    'route': service.authorizeUrl.bind(service)
};

exports.oauth2Callback = {
    'path' : '/jive/oauth/callback',
    'verb' : 'get',
    'jiveLocked' : true,
    'route': service.oauth2Callback.bind(service)
};
