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
var jive = require("jive-sdk")
var https = require("https");
var url = require('url');
var Q = require("q");

var placeStore = require("./PlaceStore");
var gitHubFacade = require("./GitHubFacade");
var jiveDecorator = require("./JiveDecorators");
var JiveApi = require("./JiveApiFacade");
var JiveAuth = require("./JiveOauth");


function ErrorResponse(res,error){
    console.log(error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error));
}

function contentResponse(res, content){
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(content));
}

function SplitRepo(fullname){
    var parts = fullname.split("/");
    return {owner: parts[0], repo: parts[1]};
}

function getGitHubOauthTokenForPlace(placeUrl){
    return placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        return gitHubFacade.createOauthObject(linked.github.token.access_token);
    })
}

exports.getUserRepos = function(req, res){
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];
    if(!placeUrl || placeUrl === ""){
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify("Specify place api url"));
    }

    getGitHubOauthTokenForPlace(placeUrl).then(function(authOptions){
        return gitHubFacade.getCurrentUser(authOptions).then(function(user){
            var username = user.login;
            return gitHubFacade.getCompleteRepositoryListForUser(username, authOptions).then(function(repos){
                contentResponse(res, repos);
            });
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.getPlaceIssues = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;

    placeStore.getPlaceByUrl(placeUrl).then(function (linked) {
        var auth = gitHubFacade.createOauthObject( linked.github.token.access_token);
        gitHubFacade.getRepositoryIssues(linked.github.repoOwner,linked.github.repo,auth).then(function (issues) {
            if(issues.length){
                 return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
                    var jAuth = new JiveAuth(linked.jive.access_token, linked.jive.refresh_token, function () {
                        //fill in refresh scheme
                    });
                    var japi = new JiveApi(community, jAuth);
                    Q.all(issues.map(function (issue) {
                        return jiveDecorator.decorateIssueWithJiveContent(japi, issue);
                    })).then(function (decIssues) {
                        contentResponse(res, decIssues);
                    })
                });
                }else{
                    contentResponse(res, issues);
                }

        })
    }).catch(function (error) {
        ErrorResponse(res,error);
    })
}

exports.getIssueComments = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var issueNumber = queryParams.number;
    var placeUrl = queryParams.place;
    var repo = SplitRepo(queryParams.repo);

    getGitHubOauthTokenForPlace(placeUrl).then(function(authOptions){
        return gitHubFacade.getIssueComments(repo.owner, repo.repo, issueNumber, authOptions).then(function(comments){
            contentResponse(res, comments);
        });
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.changeIssueState = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;
    var repo = SplitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;
    var state =  req.body.state;

    getGitHubOauthTokenForPlace(placeUrl).then(function(authOptions){
        return gitHubFacade.changeIssueState(repo.owner, repo.repo, issueNumber, state, authOptions).then(function(confirmation){
            contentResponse(res, {success:confirmation});
        })
    }).catch(function(error){
        ErrorResponse(res, error);
    });
};

exports.newComment = function(req, res){
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;
    var repo = SplitRepo(queryParams.repo);
    var issueNumber = queryParams.number;

    var comment = req.body.newComment;

    getGitHubOauthTokenForPlace(placeUrl).then(function(authOptions){
        return gitHubFacade.addNewComment(repo.owner, repo.repo, issueNumber, comment, authOptions).then(function(confirmation){
            contentResponse(res, confirmation);
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