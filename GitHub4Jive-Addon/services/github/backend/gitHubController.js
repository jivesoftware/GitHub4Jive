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
var jive = require("jive-sdk");
var https = require("https");
var url = require('url');
var q = require("q");

var libDir = process.cwd() + "/lib/";
var placeStore = require(libDir + "github4jive/placeStore");
var gitHubFacade = require(libDir + "github4jive/gitHubFacade");
var jiveDecorator = require(libDir + "github4jive/jiveDecorators");
var JiveApi = require(libDir + "github4jive/JiveApiFacade");
var JiveAuth = require(libDir + "github4jive/JiveOauth");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// public

/**
 * This endpoint handles POSTS from GitHub. It relays payloads to the gitHubFacade for registered event handlers.
 * There is currently no validation that the request is from GitHub
 */
exports.gitHubWebHookPortal = function (req, res) {
    var event = req.headers["x-github-event"];
    var data = req.body;
    jive.logger.info("Received GitHub data: " + event);
    gitHubFacade.handleIncomingWebhookEvent(event, data);
    res.writeHead(202);
    res.end();
};

/**
 * Retrieve the list of repositories that the user who configured the place can access.
 * @param {string} place api url
 * @return {[object]} array of GitHub repository objects
 */
exports.getUserRepos = function (req, res) {
    var url_parts = url.parse(req.url, true);
    var queryPart = url_parts.query;
    var placeUrl = queryPart["place"];
    if (!placeUrl || placeUrl === "") {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify("Specify place api url"));
    }

    getGitHubOauthTokenForPlace(placeUrl).then(function (authOptions) {
        return gitHubFacade.getCurrentUser(authOptions).then(function (user) {
            var username = user.login;
            return gitHubFacade.getCompleteRepositoryListForUser(username, authOptions).then(function (repos) {
                contentResponse(res, repos);
            });
        });
    }).catch(function (error) {
        errorResponse(res, error);
    });
};

/**
 * Retrieve the list of issues for the repository linked to a place.
 * @param {string} place api url
 * @return {[object]} array of GitHub issue objects
 */
exports.getPlaceIssues = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;

    placeStore.getPlaceByUrl(placeUrl).then(function (place) { // fully hydrated place record includes access tokens and ext props
        var auth = gitHubFacade.createOauthObject(place.github.token.access_token);
        gitHubFacade.getRepositoryIssues(place.github.repoOwner, place.github.repo, auth).then(function (issues) {
            if (issues.length) {
                return jive.community.findByJiveURL(place.jiveUrl).then(function (community) {
                    var jAuth = new JiveAuth(place.placeUrl, place.jive.access_token, place.jive.refresh_token);
                    var japi = new JiveApi(community, jAuth);
                    q.all(issues.map(function (issue) {
                            return jiveDecorator.decorateIssueWithJiveContent(japi, placeUrl, issue);
                        })).then(function (decIssues) {
                        contentResponse(res, decIssues);
                    })
                });
            } else {
                contentResponse(res, issues);
            }
        })
    }).catch(function (error) {
        errorResponse(res, error);
    })
};

/**
 * Retrieve the list of comments for a given repo issue.
 * @param {string} place api url
 * @param {integer} number of the issue in the repository
 * @param {string} repo the fullname of the repository owner/repo. Note: can be retrieved from the record. Client already has the information though
 * @return {[object]} array of GitHub issue objects
 */
exports.getIssueComments = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var issueNumber = queryParams.number;
    var placeUrl = queryParams.place;
    var repo = splitRepo(queryParams.repo);

    getGitHubOauthTokenForPlace(placeUrl).then(function (authOptions) {
        return gitHubFacade.getIssueComments(repo.owner, repo.repo, issueNumber, authOptions).then(function (comments) {
            comments.forEach(function (comment) {
                if (comment.body.indexOf("<!--Jive-->") == 0) {//Comment generated by this add on
                    var afterJiveMarker = comment.body.split("]").slice(3);
                    afterJiveMarker[0] = afterJiveMarker[0].substr(1); //remove space
                    comment.body = afterJiveMarker.join("]");
                }
            });
            contentResponse(res, comments);
        });
    }).catch(function (error) {
        errorResponse(res, error);
    });
};

/**
 * Change the state of an issue to open or closed. No errors are thrown if the state is already in the specified state
 * @param {string} place api url
 * @param {integer} number of the issue in the repository
 * @param {string} repo the fullname of the repository owner/repo. Note: can be retrieved from the record. Client already has the information though
 * @param {string} state BODY payload. Should be "open" or "closed";
 * @return {object} object with success member for error checking.
 */
exports.changeIssueState = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;
    var repo = splitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;
    var state = req.body.state;

    getGitHubOauthTokenForPlace(placeUrl).then(function (authOptions) {
        return gitHubFacade.changeIssueState(repo.owner, repo.repo, issueNumber, state, authOptions).then(function (confirmation) {
            contentResponse(res, {success: confirmation});
        })
    }).catch(function (error) {
        errorResponse(res, error);
    });
};

/**
 * Change which labels are on an issue.
 * @param {string} place api url
 * @param {integer} number of the issue in the repository
 * @param {string} repo the fullname of the repository owner/repo. Note: can be retrieved from the record. Client already has the information though
 * @param {[string]} labels BODY payload. The array should contain all labels that should be on the issue.
 * @return {object} object with success member for error checking.
 */
exports.changeIssueLabels = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;
    var repo = splitRepo(queryParams.repo);
    var issueNumber = queryParams.number;
    var ticketID = queryParams.ticketID;
    var labels = req.body.labels;

    getGitHubOauthTokenForPlace(placeUrl).then(function (authOptions) {
        return gitHubFacade.changeIssueLabels(repo.owner, repo.repo, issueNumber, labels, authOptions).then(function (confirmation) {
            contentResponse(res, {success: confirmation});
        })
    }).catch(function (error) {
        errorResponse(res, error);
    });
};

/**
 * Create a new comment on an issue. Currently, this function does not prepend the Jive user information
 * that is applied from a normal Jive comment in a discussion.
 * @param {string} place api url
 * @param {integer} number of the issue in the repository
 * @param {string} repo the fullname of the repository owner/repo. Note: can be retrieved from the record. Client already has the information though
 * @return {object} object with success member for error checking.
 */
exports.newComment = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;
    var repo = splitRepo(queryParams.repo);
    var issueNumber = queryParams.number;

    var comment = req.body.newComment;

    getGitHubOauthTokenForPlace(placeUrl).then(function (authOptions) {
        return gitHubFacade.addNewComment(repo.owner, repo.repo, issueNumber, comment, authOptions).then(function (confirmation) {
            contentResponse(res, {success: confirmation});
        });
    }).catch(function (error) {
        errorResponse(res, error);
    });

};

/**
 * create a new issue on the linked repository
 * @param {string} place api url
 * @param {string} title BODY payload
 * @param {string} body BODY payload  the body of the issue
 * @return {object} object with success member for error checking.
 */
exports.newIssue = function (req, res) {
    var queryParams = url.parse(req.url, true).query;
    var placeUrl = queryParams.place;

    var title = req.body.title;
    var body = req.body.body;

    if (!title) {
        errorResponse(res, Error("Title cannot be empty"));
    } else {
        getLinkedPlace(placeUrl).then(function (linked) {
            var authOptions = gitHubFacade.createOauthObject(linked.github.token.access_token);
            return gitHubFacade.newIssue(linked.github.repoOwner, linked.github.repo, title, body, authOptions)
                .then(function (confirmation) {
                    contentResponse(res, {success: confirmation});
                })
                .catch(function (error) {
                    errorResponse(res, error);
                })
        });
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// private helpers

function errorResponse(res, error) {
    console.log(error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error));
}

function contentResponse(res, content) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(content));
}

function splitRepo(fullname) {
    var parts = fullname.split("/");
    return {owner: parts[0], repo: parts[1]};
}

function getLinkedPlace(placeUrl) {
    return placeStore.getPlaceByUrl(placeUrl);
}

function getGitHubOauthTokenForPlace(placeUrl) {
    return getLinkedPlace(placeUrl).then(function (place) {
        return gitHubFacade.createOauthObject(place.github.token.access_token);
    })
}

