/* Github module for Jive Anywhere

   ModuleContext, JCommon and $ are provided by the module manager
   Recommended URL filter: github.com
*/

this.minimumRequiredVersion = 2.1;

this.init = function () {
    // prepare preview template, compile markup as named templates
    var pageDataTemplate = ModuleContext.getResourceFile("GithubPageDataTemplate.html");

    $.templates({
        githubPageDataTemplate: pageDataTemplate
    });
};

this.onGetPreviewData = function (openGraphMetadata, isFinal, customValues, callback) {
    // extract fields by invoking getPreviewData() on pagescript.js
    ModuleContext.runPageScript("getPreviewData", null, function (pageData) {
        // render preview template using extracted data and predefined GithubPageDataTemplate.html
        var html = $.render.githubPageDataTemplate(pageData);
        callback(html);
    });
};

this.onGetUrlSearchResults = function (searchData, callback) {
    var issue = extractIssueTitle();
        
    // search results by querying issue name
    var query = "\"" + issue + "\"";
    ModuleContext.connectionContexts.activeConnection.clientFacade.search(query, searchData.offset, searchData.limit, searchData.sortBy, searchData.isAscending, callback);
};

this.onGetModuleUI = function (callback) {
    var moduleUiInfo = { defaultTabId: 0, tabs: [{ title: extractIssueTitle() }, {}] };
    callback(moduleUiInfo);
};


var extractIssueTitle = function () {
    var title = ModuleContext.pageInfo.title;
    if (title.indexOf("\u00B7") > 0) {
        return $.trim(title.substring(0, title.indexOf("\u00B7")));
    }
    else {
        return title;
    }
};
