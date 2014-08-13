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

var placeStore = require("./PlaceStore");
var oAuth = require('./OauthProvider');
var gitHubFacade = require("./GitHubFacade");



function ErrorResponse(res,error){
    console.log(error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error));
}

function SplitRepo(fullname){
    var parts = fullname.split("/");
    return {owner: parts[0], repo: parts[1]};
}

function getGitHubOauthTokenForPlace(placeUrl){
    return placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        return {"type": "oauth", "token":linked.github.token.access_token};
    })
}

exports.isAuthenticated = function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var viewerID = query['viewerID'];
    var ticketID = query['ticketID'];
    console.log("isAuthenticated?? viewerID="+viewerID+" ticketID="+ticketID);

    if (viewerID == undefined)
        viewerID = ticketID;

    if (viewerID == undefined)
    {
        // still undefined, we can't continue .. just return and don't put anything in the body ...
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
        return;
    }

    oAuth.getOauthToken(ticketID).then(function(authOptions){
        return gitHubFacade.isAuthenticated(authOptions).then(function(authenticated){
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(authenticated));
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.getUserRepos = function(req, res){
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];

    getGitHubOauthTokenForPlace(placeUrl).then(function(authOptions){
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

exports.getIssueComments = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var repo = SplitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;

    oAuth.getOauthToken(ticketID).then(function(authOption){
        return gitHubFacade.getIssueComments(repo.owner, repo.repo, issueNumber, authOption).then(function(comments){
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(comments));
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.changeIssueState = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var repo = SplitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;
    var state = queryParams.state;

    oAuth.getOauthToken(ticketID).then(function(authOptions){
        return gitHubFacade.changeIssueState(repo.owner, repo.repo, issueNumber, state, authOptions).then(function(confirmation){
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(confirmation));
        })
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.newComment = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var repo = SplitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;

    var comment = req.body.newComment;

    oAuth.getOauthToken(ticketID).then(function(authOptions){
        return gitHubFacade.addNewComment(repo.owner, repo.repo, issueNumber, comment, authOptions).then(function(confirmation){
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(confirmation));
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });

};

exports.gitHubWebHookPortal = function(req, res){
    var event = req.headers["x-github-event"];
    var data = req.body;

    gitHubFacade.notifyNewGitHubHookInfo(event, data);
    res.writeHead(204);
    res.end();
};