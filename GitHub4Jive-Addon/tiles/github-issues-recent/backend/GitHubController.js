/*
 * Copyright 2014 Jive Software
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


/*
 * This module should only contain login pertaining to client calls into Github through OSAPI
 */

var https = require("https");
var url = require('url');

var sampleOauth = require('./routes/oauth/sampleOauth');
var gitHubFacade = require("../../../common/GitHubFacade");



function ErrorResponse(res,error){
    console.log(error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error));
}

exports.getUserRepos = function(req, res){
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var query = queryPart["query"];
    var ticketID = queryPart["ticketID"];

    sampleOauth.getOauthToken(ticketID).then(function(authOptions){
        return gitHubFacade.getCurrentUser(authOptions).then(function(user){
            var username = user.login;
            return gitHubFacade.getCompleteRepositoryListForUser(username, authOptions).then(function(repos){
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(repos) );
            });
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};