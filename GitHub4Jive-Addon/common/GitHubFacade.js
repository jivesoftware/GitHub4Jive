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

function getFullCommitDetails(git, owner, repo, sha){
    var deferred = Q.defer();
    git.repos.getCommit({"user":owner, "repo": repo, "sha": sha}, function(error, commit){
        if(error){
            deferred.reject(new Error(error));
        }
        else{
            deferred.resolve(commit);
        }
    });
    return deferred.promise;
}

function getUsersRepositories(git, user){
    var deferred = Q.defer();
    git.repos.getFromUser({"user": user, "type":"all"}, function(error, repositories){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(repositories);
        }
    });
    return deferred.promise;
}

function getOrgsRepositories(git, org){
    var deferred = Q.defer();
    git.repos.getFromOrg({"org": org, "type":"member"}, function(error, repos){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(repos);
        }
    });
    return deferred.promise;
}

/********************* public Functions **************************/

exports.isAuthenticated = function(authOptions){
    var deferred = Q.defer();
    var git = GitHubInstance(authOptions);
    git.user.get({}, function(error, user){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(true);
        }
    });
    return deferred.promise;
}


exports.getChangeList = function(owner, repo, authOptions, upTo){
    var deferred = Q.defer();
    var git = GitHubInstance(authOptions);
    git.repos.getCommits({"user":owner,"repo": repo}, function(error, commits){
        if(error){
            console.log(error);
            deferred.reject(new Error(error));
        }
        else{
            commits = commits.slice(0, (upTo || 5));
            Q.all(commits.map(function(commit) {
                return getFullCommitDetails(git, owner, repo, commit.sha).then(function(commit){
                    var commitMessage = commit.commit.message;
                    var filesChanged = commit.files.map(function(file){
                        return {fileName: file.filename};
                    });
                    return {commitMessage: commitMessage, changes: filesChanged};
                });
            })).then(function(changes){
                deferred.resolve(changes);
            });
        }
    });
    return deferred.promise;
};


exports.getCompleteRepositoryListForUser = function(user, authOptions){
    var deferred = Q.defer();
    var git = GitHubInstance(authOptions);
    getUsersRepositories(git, user).then(function(repos){
        git.orgs.getFromUser({"user":user, "type": "member"}, function(error, orgs){
            if(error){
                deferred.reject(error);
            }else{
                Q.all(orgs.map(function(org){
                    return getOrgsRepositories(git, org.login);
                })).then(function(orgRepos){
                    return repos.concat(orgRepos[0]);
                }).then(function(completeRepos){

                   deferred.resolve(completeRepos.map(function(repo){
                       return {"name":repo.name,"owner": repo.owner.login, "fullName": repo.owner.login + "/" + repo.name};
                   }));
                });
            }
        })
    });

    return deferred.promise;
};

exports.getCurrentUser = function(authOptions){
    var deferred = Q.defer();
    var git = GitHubInstance(authOptions);
    git.user.get({}, function(error, user){
        if(error){
            return deferred.reject(error);
        }else{
            return deferred.resolve(user);
        }
    });
    return deferred.promise;
};

exports.getRepositoryIssues = function(owner, repo, authOptions, upTo){
    var deferred = Q.defer();
    var git = GitHubInstance(authOptions);
    git.issues.repoIssues({"user" : owner, "repo" : repo}, function(error, issues){
        if(error){
            deferred.reject(error);
        }else{
            deferred.resolve(issues);
        }
    });
    return deferred.promise;
}