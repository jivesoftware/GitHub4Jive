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

var GitHubApi = require("github");
var Q = require("q");

var config = require("../jiveclientconfiguration.json");

/********************* Private Functions **************************/

function GitHubInstance(auth){
    var git = new GitHubApi({version: "3.0.0"});
    if(auth){
        git.authenticate(auth)
    }
    return git;;
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



/********************* public Functions **************************/

exports.isAuthenticated = function(authOptions){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.user.get,{}).then( function( user){
        return true;
    });
}


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


exports.getCompleteRepositoryListForUser = function(user, authOptions){
    var git = GitHubInstance(authOptions);
    return getUsersRepositories(git, user).then(function(repos){
        return deferredTemplate(git.orgs.getFromUser,{"user":user, "type": "member"}).then( function(orgs){
            return Q.all(orgs.map(function(org){
                return getOrgsRepositories(git, org.login);
            })).then(function(orgRepos){
                return repos.concat(orgRepos[0]);
            }).then(function(completeRepos){
                return completeRepos.map(function(repo){
                    return {"name":repo.name,"owner": repo.owner.login, "fullName": repo.owner.login + "/" + repo.name};
                });
            });
        })
    });
};

exports.getCurrentUser = function(authOptions){
    var git = GitHubInstance(authOptions);
    return getCurrentUser(git);
};

exports.getRepositoryIssues = function(owner, repo, authOptions, upTo){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.repoIssues, {"user" : owner, "repo" : repo});
}

exports.getIssueComments = function(owner, repo, issueNumber, authOptions, upTo){
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.getComments,{"user" : owner, "repo": repo, "number" : issueNumber} );
}

exports.changeIssueState = function(owner, repo, issueNumber, state, authOptions){
    if(state === "closed" && state == "open"){
        throw Error("Invalid Issue State");
    }
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.edit, {"user": owner, "repo": repo, "number": issueNumber, "state": state}).then(function(issue){
        return issue.state === "closed";
    });
};

exports.addNewComment = function(owner, repo, issueNumber, newComment, authOptions){
    if(!newComment || newComment === "") {
        throw Error("Comment must not be Empty.");
    }
    var git = GitHubInstance(authOptions);
    return deferredTemplate(git.issues.createComment, {"user":owner, "repo": repo, "number": issueNumber, "body": newComment}).then(function(comment){
        return comment && comment.body === newComment;
    });
};

var repoHooks = {};

function updateGitHubHook(git,owner, repo, events){
    return deferredTemplate( git.repos.createHook,
        {"user": owner, "repo": repo, "name": "web",
            "config": JSON.stringify( { "url": config.clientUrl + ":" + config.port +  "/example-github/gitHubHookPortal", "content_type": "json"}),
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
            if(hook.name == "web"){
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
};

function EventHandler(event, handler){
    return {event: event,token: guid(),handler: handler};
}

var events = {
    Issue : "issues"
};

/*
 * Hook
 *   events
 *       issue
 *           handlers
 *               [{event,token,handler}]
 *       commit
 *           handlers
 *              [{event,token,handler}]
 * */

function currentSubscribedEvents(hook){
    return Object.keys(hook).events.map(function(event){return hook.events[event].event;})
}

function subscribeTo(git,owner,repo, gitEvent, handler){
    var fullName = owner + "/" + repo;
    var hook = repoHooks[fullName];
    if(!hook){


        return deletePreviousHooks(git, owner, repo).then(function(){
            updateGitHubHook(git,owner, repo, [gitEvent]).then(function(hookResponse){
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
            var newEventList = currentSubscribedEvents(hook).push(gitEvent);
            return updateGitHubHook(git,owner, repo, newEventList).then(function(hookResponse){
                hook.key = hookResponse.id;
                var eventHandler = EventHandler(gitEvent, handler);
                hook.events[gitEvent].handlers.push(eventHandler);
                return eventHandler.token;
            });
        }

    }
}

exports.subscribeToRepoEvent = function(owner, repo, gitEvent, authOptions, handler){
    if(!(owner && repo && gitEvent && authOptions)){
        throw Error("Invalid subscription parameters.");
    }
    if(Object.keys(events).map(function(key){return events[key];}).indexOf(gitEvent) < 0){
        throw Error("Invalid GitHub Event.");
    }if(!handler){
        throw Error("Event handler cannot be null.");
    }
    var git = GitHubInstance(authOptions);
    return subscribeTo(git, owner, repo, gitEvent, handler);
};

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


exports.unSubscribeFromRepoEvent = function(token){
    var path = findPathToHandler(token);
    var repo = repoHooks[path.hook]
    var event = repo.events[path.event];

    var handler = event.handlers.splice(path.handler, 1)[0];

    if(event.handlers.length == 0){
        if(!(delete repo.events[path.event])){
            throw Error("Unable to unregister hook event.");
        }

        var currentEvents = currentSubscribedEvents(repo);
        var unregisterAction;
        var repoParts = repo.split("/");
        var owner =  repoParts[0];
        var r = repoParts[1];
        if(currentEvents.length == 0){
            unregisterAction = deleteRepoHook(git,owner, r, repo.key);
        }else{
            unregisterAction = updateGitHubHook(git,owner, r, currentEvents);
        }
        return unregisterAction;
    }
    return Q.delay(0).then(function(){return true;});//sorry for the hack. Makes the interface consistent when including asynchronous code
}

exports.notifyNewGitHubHookInfo = function(eventType, eventData){
    if(eventType == "ping"){

    }else{
        var repo = repoHooks[eventData.repository.full_name];
        repo.events[eventType].handlers.forEach(function(handler){
            handler.handler(eventData);
        });
    }

};

exports.Events = events;