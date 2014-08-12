var jive = require('jive-sdk');
var Q = require("q");
var gitHubFacade = require("../../../common/GitHubFacade");
var JiveFacade = require("../../../common/JiveApiFacade");
var JiveContentBuilder = require("../../../common/JiveContentBuilder");
var JiveOauth = require("../../../common/JiveOauth");


function getDiscussionForIssue(jiveApi, issueId){
    return jiveApi.getByExtProp("GitHub4Jive_IssueId", issueId).then(function (contents) {
        return contents.list[0];
    });
}

function setupRepoEventHandlers(community, jiveAuthenticator, placeID, owner, repo, gitHubToken){
    var auth = {"type": "oauth", "token":gitHubToken};
    var japi = new JiveFacade(community, jiveAuthenticator);

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth, function (gitData) {
        if(gitData.action === "created") {
            var builder = new JiveContentBuilder();
            var content = builder.discussion()
                .parentPlace(placeID)
                .subject(gitData.issue.title)
                .body(gitData.issue.body)
                .build();
            japi.create(content).then(function (contentResponse) {
                var contentID = contentResponse.apiID;
                //attach ext props to get discussion later
                return japi.attachProps(contentID, {
                    "GitHub4Jive_IssueId": gitData.issue.id,
                    "GitHub4Jive_IssueNumber": gitData.issue.number//may not be correct field name
                });
            });

        }else if(gitData.action === "opened"){
            getDiscussionForIssue(japi, gitData.issue.id).then(function (discussion) {
                japi.unMarkFinal(discussion.id);
            });
        }else if(gitData.action === "closed"){
            getDiscussionForIssue(japi, gitData.issue.id).then(function (discussion) {
                japi.markFinal(discussion.id);
            });
        }


    }).then(function () {
        return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.IssueComment, auth, function (gitData) {

            getDiscussionForIssue(japi, gitData.issue.id).then(function (discussion) {
                var builder = new JiveContentBuilder();
                var comment = builder.message()
                    .body(gitData.comment.body)
                    .build();
                japi.replyToDiscussion(discussion.id, comment).then(function (response) {
                    if (!response.success) {
                        jive.logger.error("Error creating comment on " + discussion.subject);
                    }
                })
            }).catch(function (error) {
                jive.logger.error(error);
            });
        });
    });

}

exports.onBootstrap = function(app) {

/* need to set up all linked places with repoEvent handlers for issue and comment creation
 * retrieve all places by querying by ext prop and then get user id attached to place
 * use that id to retrieve the stored access token from persistence to authenticate with github
 */



    var places = [];
    places.forEach(function (linked) {
        var place = linked.placeID;
        var repo = linked.repo;
        var repoOwner = linked.repoOwner;
        var jiveToken = linked.jive.token;
        var jiveRefresh = linked.jive.refresh;
        var gitHubToken = linked.git.token;
        var jiveurl = linked.jiveUrl;
        var jiveAuth = new JiveOauth(jiveToken, jiveRefresh, function () {

        });
        setupRepoEventHandlers({jiveUrl:jiveurl }, jiveAuth,place, repoOwner, repo, gitHubToken);
    });


//gonna need to sign service anyways. Otherwise we can't query for places based on ext property
//    var communities = [];
//    communities.forEach(function (community) {
//        var serviceToken = "";
//        var servAuth = new JiveOauth(serviceToken)
//        var japi = new JiveFacade(community, servAuth);
//
//        japi.getByExtProp("GitHub4Jive_Enabled", "true").then(function (places) {
//            Q.all(places.map(function (place) {
//                return place.retrieveAllExtProps().then(function (extProps) {
//
//                    var repoOwner = extProps.GitHub4Jive_RepoOwner;
//                    var repo = extProps.GitHub4Jive_Repo;
//
//                    var usersJiveToken = "";
//                    var usersGitHubToken = "";
//                    var onBehalfOf = new JiveOauth(usersJiveToken);
//
//                    return setupRepoEventHandlers(community,onBehalfOf, place.id,repoOwner, repo,usersGitHubToken);
//                });
//            })).then(function (subscriptionPromises) {
//                    //do something when all are done
//            });
//
//        });
//    })

};

/*
 * Event handlers: need to detect new places being linked can all
 * common function to set up repoEvent handler
 */

//exports.OnNewPlace = function(place) {


//}