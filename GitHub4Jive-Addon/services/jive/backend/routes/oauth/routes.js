var service = require('./service_impl.js');

exports.authorizeUrl = {
    'path' : '/oauth/authorizeUrl',
    'verb' : 'get',
    'route': service.authorizeUrl.bind(service)
};

exports.oauth2Callback = {
    'path' : '/oauth/oauth2Callback',
    'verb' : 'get',
    'route': service.oauth2Callback.bind(service)
};

