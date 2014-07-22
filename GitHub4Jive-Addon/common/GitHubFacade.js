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