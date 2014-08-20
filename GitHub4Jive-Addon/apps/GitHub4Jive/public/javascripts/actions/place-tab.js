var place;
var app = {

    currentView: gadgets.views.getCurrentView().getName(),
    currentViewerID: -1,
    initGadget: function () {
        console.log('initGadget ...');
    },

    initjQuery: function () {
        console.log('initjQuery ...');
        gadgets.window.adjustHeight();
    },

    handleContext: function (context) {
        console.log('handleContext ...');

        if (context) {

            osapi.jive.corev3.resolveContext(context, function (result) {
                place = result.content;

                osapi.http.get({
                    'href': host + '/github/place/issues?' +
                        "&place=" + encodeURIComponent(place.resources.self.ref) +
                        "&ts="+ new Date().getTime(),
                    'format': 'json',
                    'authz': 'signed'
                }).execute(function (response) {
                    var data;
                    if(response.status < 200 || response.status >= 300 || response.error){
                        data = response.error;
                    }else{
                        data = response.content;
                        var table = $("#Issues");
                        var tbody = table.children("tbody");
                        $.each(data,function (idx, issue) {
                            var number = issue.number;
                            var title = issue.title;
                            var state = issue.state;

                            var row = "<tr><td>"+number+"</td><td><a target='_blank' href='"+(issue.jiveContentLink || issue.html_url)+"'>"+title+"</a></td><td>"+state+"</td></tr>";
                            tbody.append(row);
                        });
                        table.on("draw.dt", gadgets.window.adjustHeight);
                        table.dataTable({"order": [[2,"desc"],[ 0, "desc" ]]});
                    }
                });


            });
        };
    }
};

osapi.jive.core.container.getLaunchContext(function(resp){
    app.handleContext(resp.jive.content);

});

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));

$(function () {
    app.initjQuery();
});




