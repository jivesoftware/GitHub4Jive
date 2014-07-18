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

function GitHubInstance(){
    return new GitHubApi({version: "3.0.0"});
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



/********************* public Functions **************************/


exports.getChangeList = function(owner, repo, oauthToken, upTo){
    var deferred = Q.defer();
    var git = GitHubInstance();
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