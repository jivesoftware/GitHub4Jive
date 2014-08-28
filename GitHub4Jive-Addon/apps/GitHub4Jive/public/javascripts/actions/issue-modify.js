$(function () {
    $("#btn_issue").click(function (e) {
        var title = $("#Title").val();
        var body = $("#Body").val();

        var bodyPayload = {
            "title": title,
            "body": body
        };
        osapi.http.post({
            'href': host + '/github/place/newIssue?' +
                "ts=" + new Date().getTime()+
                "&place=" + encodeURIComponent(placeUrl()),
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {

            //alert( "status=" + response.status) ;
            if ((response.status >= 400 && response.status <= 599) || !JSON.parse(response.content).success) {
                alert("ERROR!" + JSON.stringify(response.content));
            }
            osapi.jive.core.container.closeApp();
        });
    });

    $("#btn_exit").click(function () {
        osapi.jive.core.container.closeApp();
    });

    $(document).bind("github4jiveAuthorized", function () {
        gadgets.window.adjustWidth(800);
    });

    $('.btn').button();
});