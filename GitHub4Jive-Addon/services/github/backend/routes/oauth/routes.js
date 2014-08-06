var service = require('./service_impl.js');

exports.authorizeUrl = {
    'path' : '/github/oauth/authorize',
    'verb' : 'get',
    'route': service.authorizeUrl.bind(service)
};

exports.oauth2Callback = {
    'path' : '/github/oauth/callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};

