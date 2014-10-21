var jive = require("jive-sdk");
var q = require("q");

var libDir = process.cwd() + "/lib/";
var placeStore = require(libDir + "github4jive/placeStore");
var gitFacade = require(libDir + "github4jive/gitHubFacade");
var tileFormatter = require(libDir + "github4jive/tileFormatter");
var JiveDecorator = require(libDir + "github4jive/jiveDecorators");
var JiveOAuth = require(libDir + "github4jive/JiveOauth");
var JiveApi = require(libDir + "github4jive/JiveApiFacade");

// constants////////////////////////////
var GITHUB_RECENT_ISSUES_TILE_NAME = "github-issues-recent";
var colorMap = {
    'green':'https://cdn1.iconfinder.com/data/icons/function_icon_set/circle_green.png',
    'red':'https://cdn1.iconfinder.com/data/icons/function_icon_set/circle_red.png',
    'disabled':'https://cdn1.iconfinder.com/data/icons/function_icon_set/warning_48.png'
};

/**
 * This is used to update the recent issues tile on any change to an issue.
 *
 * Tile instance data:
 * {
 *   "id": "3f2dbd48-746f-41cc-a893-d2b96eeaa887",
 *   "url": "https://sandbox.jiveon.com/api/jivelinks/v1/tiles/3306/data",
 *   "config": {
 *     "parent": "https://sandbox.jiveon.com/api/core/v3/places/95698"  <---- tile parent URL
 *   },
 *   "name": "github-issues-recent",
 *   ..
 * }
 * @param {object} instance of a tile
 */
exports.processTileInstance = function processTileInstance(instance) {
    if ( instance.name === GITHUB_RECENT_ISSUES_TILE_NAME ) {
        var placeURL = instance.config.parent;
        return placeStore.getPlaceByUrl(placeURL).then(function (place) {   // get tile parent place, including ext props
            var auth = gitFacade.createOauthObject(place.github.token.access_token);
            return gitFacade.getRepositoryIssues(place.github.repoOwner, place.github.repo, auth, 10, "open")
                .then(function (issues) {
                    processTileIssues(instance, place, issues);
                });
        });
    }
};

function decorateIssuesWithColoredIcons(issues){
    issues.forEach(function(issue){
        var labels = issue.labels.map(function(label){return label.name;});
        var icon = labels.indexOf("bug") >= 0 ? colorMap["red"] : colorMap["green"];
        issue["icon"] = icon;
    });
    return issues;
}

function decorateIssuesWithActions(issues, repository){
    issues.forEach(function(issue){
        issue["action"] = {
            context : {
                url:            issue.html_url,
                title:          issue.title,
                number:         issue.number,
                repo:           repository,
                labels:         issue.labels,
                discussionLink: issue.jiveContentLink
            }
        };
    });
    return issues;
}

function decorateIssuesWithJiveContentLinks(jiveApi, place, issues){
    return q.all(issues.map(function (issue) {
        return JiveDecorator.decorateIssueWithJiveContent(jiveApi, place, issue);
    }));
}

function processTileIssues(instance, linked, issues){
    var fullName = linked.github.repoOwner + "/" + linked.github.repo;
    if (issues.length == 0) {
        jive.tiles.pushData(instance,
            {data: tileFormatter.emptyListData(fullName, "No open issues")});
    }
    else {
        return jive.community.findByJiveURL(linked.jiveUrl).then(function (community) {
            var place = instance.config.parent;
            var jiveAuth = new JiveOAuth(place, linked.jive.access_token, linked.jive.refresh_token);
            var jiveApi = new JiveApi(community, jiveAuth);

            return decorateIssuesWithJiveContentLinks(jiveApi, place, issues).then(function (issues) {
                var decoratedIssues = decorateIssuesWithColoredIcons(issues);

                decoratedIssues = decorateIssuesWithActions(decoratedIssues, fullName);
                var formattedIssues = tileFormatter.formatListData(fullName, decoratedIssues,
                    {"text": "title"});
                jive.tiles.pushData(instance, {data: formattedIssues});

            });

        });
    }
}
