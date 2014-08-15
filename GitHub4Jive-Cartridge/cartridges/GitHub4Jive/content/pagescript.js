/* Github cartridge for Jive Anywhere (page content script)

   PageModuleContext, JCommon and $ are provided by the module manager
*/

this.getPreviewData = function (params, sendResponse) {
    var issue = new Object();
    if ($('.js-issue-title').length) {
        issue.title = $(".js-issue-title").text();
    }
    else {
        issue.title = $('meta[property="og:title"]').attr('content');
    }
    var authorObj = $(".flex-table-item-primary .author");
    issue.author = authorObj.text();
    issue.authorUrl = "https://github.com" + authorObj.attr("href");
    issue.url = document.location.href;
    issue.issueNumber = getIssueNumber();
    issue.issueTag = getIssueTag();
    issue.description = $(".comment-body:first").text();
    sendResponse(issue);
};

this.getSearchQuery = function (params, sendResponse) {
    sendResponse({ "query" : getIssueTag() });
}

function getIssueNumber () {
    var issueNumner = "";
    if ($(".gh-header-number").length) {
        issueNumber = $(".gh-header-number").text().substring(1);
    }
    return issueNumber;
}

function getIssueTag () {
    var repositoryName = $('meta[property="og:title"]').attr('content');
    return "["+repositoryName+"-"+getIssueNumber()+"]";
}
