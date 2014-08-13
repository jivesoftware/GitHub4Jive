var jive = require('jive-sdk');
var Q = require("q");
var gitHubFacade = require("../../../common/GitHubFacade");
var JiveFacade = require("../../../common/JiveApiFacade");
var JiveContentBuilder = require("../../../common/JiveContentBuilder");
var JiveOauth = require("../../../common/JiveOauth");
var placeStore = require("../../../common/PlaceStore");


function getDiscussionForIssue(jiveApi, issueId){
    return jiveApi.getByExtProp("github4jiveIssueId", issueId).then(function (contents) {
        return contents.list[0];
    });
}

function setupRepoEventHandlers(jiveApi, placeID, owner, repo, gitHubToken){
    var auth = {"type": "oauth", "token":gitHubToken};

    return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.Issues, auth, function (gitData) {
        jive.logger.debug(gitData);
        if(gitData.action === "opened") {
            var builder = new JiveContentBuilder();
            var content = builder.discussion()
                .parentPlace(placeID)
                .subject("[" + owner + "/" + repo +"-" + gitData.issue.number + "] " + gitData.issue.title)
                .body(gitData.issue.body)
                .build();
            jiveApi.create(content).then(function (contentResponse) {
                var contentID = contentResponse.apiID;
                //attach ext props to get discussion later
                return jiveApi.attachProps(contentID, {
                    "github4jiveIssueId": gitData.issue.id,
                    "github4jiveIssueNumber": gitData.issue.number//may not be correct field name
                });
            });

        }else if(gitData.action === "reopened"){
            getDiscussionForIssue(jiveApi, gitData.issue.id).then(function (discussion) {
                jiveApi.unMarkFinal(discussion.id);
            });
        }else if(gitData.action === "closed"){
            getDiscussionForIssue(jiveApi, gitData.issue.id).then(function (discussion) {
                jiveApi.markFinal(discussion.id);
            });
        }


    }).then(function () {
        return gitHubFacade.subscribeToRepoEvent(owner, repo, gitHubFacade.Events.IssueComment, auth, function (gitData) {

            getDiscussionForIssue(jiveApi, gitData.issue.id).then(function (discussion) {
                var builder = new JiveContentBuilder();
                var comment = builder.message()
                    .body(gitData.comment.body)
                    .build();
                jiveApi.replyToDiscussion(discussion.contentID , comment).then(function (response) {
                    if (!response.success) {
                        jive.logger.error("Error creating comment on " + discussion.subject);
                        jive.logger.error(response);
                    }
                })
            }).catch(function (error) {
                jive.logger.error(error);
            });
        });
    });

}

exports.onBootstrap = function(app) {

    placeStore.getAllPlaces().then(function (places) {
        places.forEach(function (linked) {
            var place = linked.placeID;
            var jiveToken = linked.jive.access_token;
            var jiveRefresh = linked.jive.refresh_token;
            var gitHubToken = linked.github.token.access_token;
            var jiveUrl = linked.jiveUrl;
            var jiveAuth = new JiveOauth(jiveToken, jiveRefresh, function () {

            });
            jive.community.findByJiveURL(jiveUrl).then(function (community) {
                var japi = new JiveFacade(community, jiveAuth);
                japi.getAllExtProps("places/" + place).then(function (extprops) {

                    var repo = extprops.github4jiveRepo;
                    var repoOwner = extprops.github4jiveRepoOwner;

                    setupRepoEventHandlers(japi, place, repoOwner, repo, gitHubToken);
                })
            })


        });

    });
}

