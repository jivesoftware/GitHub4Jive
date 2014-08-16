gadgets.util.registerOnLoadHandler(function() {
  // add code that should run on page load here

  // resize app window to fit content
  // gadgets.window.adjustHeight();


});

var place;

// register a listener for embedded experience context
opensocial.data.getDataContext().registerListener('org.opensocial.ee.context', function (key) {
    var data = opensocial.data.getDataContext().getDataSet(key);

    console.log("==== registerListener ====");
    console.log("embedded context:", data);


});

var app = {

    currentView: gadgets.views.getCurrentView().getName(),
    currentViewerID: -1,
    initGadget: function () {
        console.log('initGadget ...');

        gadgets.actions.updateAction({
            id: "com.jivesoftware.addon.github4jive.group.tab",
            callback: app.handleContext
        });

        gadgets.actions.updateAction({
            id: "com.jivesoftware.addon.github4jive.project.tab",
            callback: app.handleContext
        });

        gadgets.actions.updateAction({
            id: "com.jivesoftware.addon.github4jive.space.tab",
            callback: app.handleContext
        });
    },

    initjQuery: function () {
        console.log('initjQuery ...');
        gadgets.window.adjustHeight(250);
    },

    handleContext: function (context) {
        console.log('handleContext ...');

        if (context) {

            osapi.jive.corev3.resolveContext(context, function (result) {
                place = result.content;

                osapi.http.get({
                    'href': host + '/github/place/issues?' +
                        "&place=" + encodeURIComponent(place.resources.self.ref),
                    'format': 'json',
                    'authz': 'signed'
                }).execute(function (response) {

                    $("#DUMP").append(response);

                });


            });
        };
    }
};

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));

$(function () {
    app.initjQuery();
});




