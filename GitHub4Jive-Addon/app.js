/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

/**
 * EXAMPLE: Demonstates how to kick off service autowiring a directory of tiles.
 */

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setup express

var express = require('express'),
    http = require('http'),
    jive = require('jive-sdk');

var app = express();

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setup jive

var failServer = function(reason) {
    console.log('FATAL -', reason );
    process.exit(-1);
};

var startServer = function () {
    if ( !jive.service.role || jive.service.role.isHttp() ) {
        var server = http.createServer(app).listen( app.get('port') || 8090, function () {
            console.log("Express server listening on port " + server.address().port);
        });
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Setting up your service

//
// Service startup sequence (Easy as 1-2-3!):
//

// 1. initialize service setup -- optionally pass in a JSON configuration object or path to a configuration object;
// if one is not provided, it assumes that [app root]/jiveclientconfiguration.json file exists.
jive.service.init(app)

// 2. autowire all available definitions in /tiles; see explanation below.
.then( function() { return jive.service.autowire(); } )

// 3. start the service, which performs sanity checks such as clientId, clientSecret, and clientUrl defined.
// if successful service start, call the start the http server function defined by you; otherwise call the
// fail one
.then( function() { return jive.service.start(); } ).then( startServer, failServer );

