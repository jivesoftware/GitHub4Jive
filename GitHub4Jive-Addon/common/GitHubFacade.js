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

var jive = require('jive-sdk');
var GitHubApi = require("github");
var Q = require("q");

var config = require("../jiveclientconfiguration.json");

/********************* Private Functions **************************/

var GITHUB_EVENT_URL = config.clientUrl + ":" + config.port + config.github.webHookUrl;

function GitHubInstance(auth){

    console.log(auth);
    var git = new GitHubApi({version: "3.0.0"});
    if(auth){
        git.authenticate(auth);
    }
    return git;
}

function deferredTemplate(toCall, callobject){
    var deferred = Q.defer();

    toCall(callobject, function(error, result){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

function getCurrentUser(git){
    return deferredTemplate(git.user.get, {});
}

function getFullCommitDetails(git, owner, repo, sha){
    return deferredTemplate(git.repos.getCommit,{"user":owner, "repo": repo, "sha": sha});
}

function getUsersRepositories(git, user){
    return getCurrentUser(git).then(function(current){
        if(current.login === user){
            return deferredTemplate(git.repos.getAll,{ "type":"all"});
        }else{
            return deferredTemplate(git.repos.getFromUser, {"user": user, "type": "all"});
        }
    });
}

function getOrgsRepositories(git, org){
    return deferredTemplate(git.repos.getFromOrg,{"org": org, "type":"member"});
}

var repoHooks = {};

function createGitHubHook(git,owner, repo, events){
    return deferredTemplate( git.repos.createHook,
        {"user": owner, "repo": repo, "name": "web",
            "config": JSON.stringify( { "url":  GITHUB_EVENT_URL, "content_type": "json"}),
            "events": events,
            "active": true
        });
}

function deleteRepoHook(git,owner, repo, key){
    return deferredTemplate(git.repos.deleteHook, {"user": owner, "repo": repo, "id": key});
}

function deletePreviousHooks(git,owner, repo){
    return deferredTemplate(git.repos.getHooks, {"user":owner, "repo": repo}).then(function(hooks){
        var hooksDeleting = [];
        hooks.forEach(function(hook){
            if(hook.config.url == GITHUB_EVENT_URL){
                hooksDeleting.push(deleteRepoHook(git, owner, repo, hook.id));
            }
        });
        return Q.all(hooksDeleting);
    });
}

function hookHasRegisteredEvent(hook, event){
    return hook.events[event] != null;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }();
}

function EventHandler(event, handler){
    return {event: event,token: guid(),handler: handler};
}

/*
 * Hook
 *   events
 *       issues
 *           handlers
 *               [{event,token,handler}]
 *       commit
 *           handlers
 *              [{event,token,handler}]
 * */

function currentSubscribedEvents(hook){
    return Object.keys(hook.events);
}

function subscribeTo(git,owner,repo, gitEvent, handler){
    var fullName = owner + "/" + repo;
    var hook = repoHooks[fullName];
    if(!hook){
        return deletePreviousHooks(git, owner, repo).then(function(){
            return createGitHubHook(git,owner, repo, [gitEvent]).then(function(hookResponse){
                var eventHandler = EventHandler(gitEvent, handler);
                repoHooks[fullName] = {events:{}, key: hookResponse.id};
                repoHooks[fullName].events[gitEvent] = {handlers:[eventHandler]};
                return eventHandler.token;
            });
        });
    }else{

        if(hookHasRegisteredEvent(hook, gitEvent)){
            var eventHandler = EventHandler(gitEvent, handler);
            hook.events[gitEvent].handlers.push(eventHandler);
            //hack to make interface consistent
            return Q.delay(0).then(function() {return eventHandler.token;});
        }else{
            var newEventList = currentSubscribedEvents(hook);
            newEventList.push(gitEvent);
            jive.logger.info(newEventList);
            return deleteRepoHook(git, owner, repo, hook.key).then(function (deleteResponse) {
                return createGitHubHook(git,owner, repo, newEventList).then(function(hookResponse){
                    hook.key = hookResponse.id;
                    var eventHandler = EventHandler(gitEvent, handler);
                    repoHooks[fullName].events[gitEvent] = {handlers:[eventHandler]};
                    return eventHandler.token;
                });
            })

        }

    }
}

function findPathToHandler(token){
    for(var repo in repoHooks){
        for(var event in repoHooks[repo].events){
            var e = repoHooks[repo].events[event];
            for(var handler in e.handlers){
                if(e.handlers[handler].token === token){
                    return {hook: repo, event: event, handler: handler};
                }
            }
        }
    }
}

function extractRepoParts(repo) {
    var repoParts = repo.split("/");
    return {owner: repoParts[0], repo: repoParts[1]};
}


/********************* public Functions **************************/

/*
 * Test the authentication object
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */

exports.createOauthObject = function (token) {
    return {"type": "oauth", "token": token};
}

exports.isAuthenticated = function(authOptions){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.user.get,{}).then( function( user){
        return true;
    });
};

/*
 * Retrieve the most recent commits and their changes
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @param upTo Number of commits to retrieve. Defaults to 5
 * @return {Promise} promise -> {commitMessage: string, changes: [{fileName: string}]}) Use .then(function(result){}; to process return asynchronously
 */
exports.getChangeList = function(owner, repo, authOptions, upTo){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.repos.getCommits, {"user":owner,"repo": repo}).then(function( commits){
        commits = commits.slice(0, (upTo || 5));
        return Q.all(commits.map(function(commit) {
            return getFullCommitDetails(git, owner, repo, commit.sha).then(function(commit){
                var commitMessage = commit.commit.message;
                var filesChanged = commit.files.map(function(file){
                    return {fileName: file.filename};
                });
                return {commitMessage: commitMessage, changes: filesChanged};
            });
        }));
    });
};

exports.getRepository = function (owner, repo, authOptions) {
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.repos.get,{"user": owner, "repo": repo});
}

/*
 * Retrieve a list of all the repositories a user has access to
 * @param user Name of the user to get list for
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.getCompleteRepositoryListForUser = function(user, authOptions){
    var git = GitHubInstance(authOptions);
    return getUsersRepositories(git, user).then(function(repos){
        return deferredTemplate(git.orgs.getFromUser,{"user":user, "type": "member"}).then( function(orgs){
            return Q.all(orgs.map(function(org){
                return getOrgsRepositories(git, org.login);
            })).then(function(orgRepos){
                return orgRepos.length > 0 ? repos.concat(orgRepos[0]) : repos;
            }).then(function(completeRepos){
                return completeRepos.length > 0 ?  completeRepos.map(function(repo){
                    return {"name":repo.name,"owner": repo.owner.login, "fullName": repo.owner.login + "/" + repo.name};
                }) : completeRepos;
            });
        })
    });
};
/*
 * Retrieve the currently authenticated user
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.getCurrentUser = function(authOptions){
    var git = GitHubInstance(authOptions);
    return getCurrentUser(git);
};

/*
 * Retrieve a list of comments for a given issue on a repository
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param issueNumber The number that corresponds to the issue you want from the repository. These are usually numeric from 1.
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @param upTo Number of comments to retrieve up to 100. Default is 30.
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.getIssueComments = function(owner, repo, issueNumber, authOptions, upTo){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.getComments,{"user" : owner, "repo": repo, "number" : issueNumber} );
};

/*
 * Retrieve a list of issues from a repository
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @param upTo Number of issues to retrieve up to 100. Default is 30.
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.getRepositoryIssues = function(owner, repo, authOptions, upTo, state){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.repoIssues, {"user" : owner, "repo" : repo, "state": (state || "all"), "per_page" : upTo});
};

/*
 * Retrieve a user's details
 * @param user Username of user
 * @param authOptions OPTIONAL object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */

exports.getUserDetails = function(user, authOptions){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.user.getFrom, {"user":user})
};

/*
 * Change the state of an issue to open or closed
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param issueNumber The number that corresponds to the issue you want from the repository. These are usually numeric from 1.
 * @param state String either "open" or "closed"
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return (promise) Use .then(function(result){}); to process return asynchronously
 */
exports.changeIssueState = function(owner, repo, issueNumber, state, authOptions){
    if(state === "closed" && state == "open"){
        throw Error("Invalid Issue State");
    }
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.edit, {"user": owner, "repo": repo, "number": issueNumber, "state": state}).then(function(issue){
        return issue.state === "closed";
    });
};

/*
 * Add a new comment to an issue
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param issueNumber The number that corresponds to the issue you want from the repository. These are usually numeric from 1.
 * @param newComment String the content of the new comment to be made. Must not be empty.
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.addNewComment = function(owner, repo, issueNumber, newComment, authOptions){
    if(!newComment || newComment === "") {
        throw Error("Comment must not be Empty.");
    }
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.createComment, {"user":owner, "repo": repo, "number": issueNumber, "body": newComment}).then(function(comment){
        return comment && comment.body === newComment;
    });
};

/*
 * Register an event handler for a GitHub Event. Events are defined on the Events member.
 * These should be done synchronously. Lag between calls to GitHub for hook registration can cause problems otherwise.
 * @param owner Entity that owns the repository. Either a git username or organization name
 * @param repo Repo name, not full name with owner
 * @param gitEvent The GitHub event that this handler should respond to. Possible values are defined on the Events member
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @param handler Callback function. Passed raw GitHub payload on event.
 * @return  {Promise} promise -> subscriptionToken This token is used to identify an event handler. Keep it to unregister an event later.
 */
exports.subscribeToRepoEvent = function(owner, repo, gitEvent, authOptions, handler){
    if(!owner){
        throw Error("Repository owner required.");
    }
    if(!repo) {
        throw Error("Repository name required.");
    }
    if(!authOptions){
        throw Error("Invalid auth object.");
    }
    if(Object.keys(events).map(function(key){return events[key];}).indexOf(gitEvent) < 0){
        throw Error("Invalid GitHub Event.");
    }if(!handler){
        throw Error("Event handler cannot be null.");
    }
    var git = GitHubInstance(authOptions);
    return subscribeTo(git, owner, repo, gitEvent, handler).catch(function (error) {
        console.log(authOptions);
        jive.logger.error(  owner + "/" + repo + ": " + error.message);
        throw error;
    });
};

/*
 * UnRegister an event handler from GitHub.
 * @param token Use the token returned from the promise of subscribeToRepoEvent to unsubscribe handler
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.unSubscribeFromRepoEvent = function(token, authOptions){
    var path = findPathToHandler(token);
    if(!path) {
        throw Error("Invalid Handler Token");
    }
    var repo = repoHooks[path.hook];
    var event = repo.events[path.event];

    var handler = event.handlers.splice(path.handler, 1)[0];

    if (event.handlers.length == 0) {
        if (!(delete repo.events[path.event])) {
            throw Error("Unable to unregister hook event.");
        }

        var currentEvents = currentSubscribedEvents(repo);
        var unregisterAction;
        var r = extractRepoParts(path.hook);
        var git = GitHubInstance(authOptions);
        return deleteRepoHook(git, r.owner, r.repo, repo.key).then(function (response) {
                if (currentEvents.length != 0) {
                    return createGitHubHook(git, r.owner, r.repo, currentEvents).then(function (hookResponse) {
                        repo.key = hookResponse.id;
                        return true;
                    });
                }else{
                    if(Object.keys(repo.events).length == 0){
                        delete repoHooks[path.hook];
                    }
                }
            });
        }
    return Q.delay(0).then(function(){return true;});//sorry for the hack. Makes the interface consistent when mixing asynchronous code
};

/*
 * Remove all outstanding GitHub events that were previously registered.
 * @param authOptions object with either type: "basic" with username and password or type: "oauth" with token: "OAuthToken"
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */
exports.RemoveAllWebHooks = function(authOptions){
    var git = GitHubInstance(authOptions);
    var repoDeletes = [];
    for(var repo in repoHooks){
        var r = extractRepoParts(repo);
        repoDeletes.push( deletePreviousHooks(git, r.owner, r.repo));
    }
    return Q.all(repoDeletes);
};

/*
 * This is used to notify event handlers of new data. This needs to be wired up to web accessible controller to pass GitHub payloads to event handlers.
 * Currently web hooks are created looking for the url set in jiveClientConfiguration.json by gitHubWebHookUrl. This url must be used to capture the GitHub Payloads.
 * @param eventType String must be either "ping" or one of the events in the Events member
 * @param eventData GitHub Payload body
 * @return {Promise} promise: Use .then(function(result){}); to process return asynchronously
 */

exports.notifyNewGitHubHookInfo = function(eventType, eventData){
    if(eventType == "ping"){

    }else{
        var repo = repoHooks[eventData.repository.full_name];
        if(repo) {
            repo.events[eventType].handlers.forEach(function (handler) {
                handler.handler(eventData);
            });
        }else{
            jive.logger.warn("Unregistered WebHook Handler for: " + eventData.repository.full_name);
        }
    }
};

var events = {
    /*
     * Triggered any time a commit is commented on.
     * */
    CommitComment: "commit_comment",
    /*
     * Triggered any time a branch or tag is created.
     * */
    Create: "create",
    /*
     * Triggered any time a branch or tag is deleted.
     * */
    Delete: "delete",
    /*
     * Triggered any time a Repository has a new deployment created from the API.
     */
    Deployment: "deployment",
    /*
     * Triggered any time a deployment for the Repository has a status update from the API.
     */
    DeploymentStatus: "deployment_status",
    /*
     * Triggered any time a repository is forked
     */
    Fork: "fork",
    /*
     * Triggered any time a Wiki page is updated
     * */
    Gollum: "gollum",
    /*
     * Triggered any time an Issue is commented on.
     */
    IssueComment: "issue_comment",
    /*
     * Triggered any time an Issue is opened or closed.
     */
    Issues : "issues",
    /*
     * Triggered any time a User is added as a collaborator to a non-Organization Repository.
     */
    Member: "member",
    /*
     * Triggered any time a Pages site is built or results in a failed build.
     */
    PageBuild: "page_build",
    /*
     * Triggered any time a Repository changes from private to public.
     */
    Public: "public",
    /*
     * Triggered any time a Commit is commented on while inside a Pull Request review (the Files Changed tab).
     */
    PullRequestReviewComment: "pull_request_review_comment",
    /*
     * Triggered any time a Pull Request is opened, closed, or synchronized (updated due to a new push in the branch that the pull request is tracking).
     */
    PullRequest: "pull_request",
    /*
     * Triggered any git push to a Repository.
     */
    Push: "push",
    /*
     * Triggered any time a Release is published in the Repository.
     */
    Release: "release",
    /*
     * Triggered any time a Repository has a status update from the API
     */
    Status: "status",
    /*
     * Triggered any time a team is added or modified on a Repository.
     */
    TeamAdd: "team_add",
    /*
     * Triggered any time a User watches the Repository.
     */
    Watch: "watch"
};


/*
 * <table>
 <tr>
 <th>Name</th>
 <th>Description</th>
 </tr>
 <tr>
 <td><code>CommitComment</code></td>
 <td>Any time a Commit is commented on.</td>
 </tr>
 <tr>
 <td><code>Create</code></td>
 <td>Any time a Branch or Tag is created.</td>
 </tr>
 <tr>
 <td><code>Delete</code></td>
 <td>Any time a Branch or Tag is deleted.</td>
 </tr>
 <tr>
 <td><code>Deployment</code></td>
 <td>Any time a Repository has a new deployment created from the API.</td>
 </tr>
 <tr>
 <td><code>DeploymentStatus</code></td>
 <td>Any time a deployment for the Repository has a status update from the API.</td>
 </tr>
 <tr>
 <td><code>Fork</code></td>
 <td>Any time a Repository is forked.</td>
 </tr>
 <tr>
 <td><code>Gollum</code></td>
 <td>Any time a Wiki page is updated.</td>
 </tr>
 <tr>
 <td><code>IssueComment</code></td>
 <td>Any time an Issue is commented on.</td>
 </tr>
 <tr>
 <td><code>Issues</code></td>
 <td>Any time an Issue is opened or closed.</td>
 </tr>
 <tr>
 <td><code>Member</code></td>
 <td>Any time a User is added as a collaborator to a non-Organization Repository.</td>
 </tr>
 <tr>
 <td><code>PageBuild</code></td>
 <td>Any time a Pages site is built or results in a failed build.</td>
 </tr>
 <tr>
 <td><code>Public</code></td>
 <td>Any time a Repository changes from private to public.</td>
 </tr>
 <tr>
 <td><code>PullRequestReviewComment</code></td>
 <td>Any time a Commit is commented on while inside a Pull Request review (the Files Changed tab).</td>
 </tr>
 <tr>
 <td><code>PullRequest</code></td>
 <td>Any time a Pull Request is opened, closed, or synchronized (updated due to a new push in the branch that the pull request is tracking).</td>
 </tr>
 <tr>
 <td><code>Push</code></td>
 <td>Any git push to a Repository. <strong>This is the default event.</strong>
 </td>
 </tr>
 <tr>
 <td><code>Release</code></td>
 <td>Any time a Release is published in the Repository.</td>
 </tr>
 <tr>
 <td><code>Status</code></td>
 <td>Any time a Repository has a status update from the API</td>
 </tr>
 <tr>
 <td><code>TeamAdd</code></td>
 <td>Any time a team is added or modified on a Repository.</td>
 </tr>
 <tr>
 <td><code>Watch</code></td>
 <td>Any time a User watches the Repository.</td>
 </tr>
 </table>
 */
exports.Events = events;