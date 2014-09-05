/**
 * Created by glen.nicol on 9/2/14.
 */
//Code in this block will only occur after authorization has occured
var stateAction = "";

$(document).bind("github4jiveAuthorized", function () {
    gadgets.window.adjustWidth(800);

    contentObject.getExtProps().execute(function (props) {
        if(props.content){
            props = props.content;
        }

        var statusText = $("#Status");
        function replaceStatusText(appendage){
            statusText.children().hide(500).promise().done(function () {
                statusText.append("<h2>"+appendage+"</h2>");
                statusText.after("<br/><p>The page will reload momentarily. You will be able to recover a comment in progress.</p>")
                window.setTimeout(function () {
                    window.top.location.href = document.referrer;
                    //osapi.jive.core.container.closeApp();//makes it a little clunky online with latency
                }, 3000);
            });
        }
        function changeIssueState(state) {
            var bodyPayload = {
                "state": state
            };
            osapi.http.post({
                'href': host + '/github/place/changeIssueState?' +
                    "ts=" + new Date().getTime() +
                    "&place=" + encodeURIComponent(placeUrl) +
                    "&repo=" + placeProps.github4jiveRepoOwner + "/" + placeProps.github4jiveRepo +
                    "&number=" + props.github4jiveIssueNumber,
                headers: { 'Content-Type': ['application/json'] },
                'noCache': true,
                'authz': 'signed',
                'body': bodyPayload
            }).execute(function (response) {

                //alert( "status=" + response.status) ;
                if ((response.status >= 400 && response.status <= 599) || !JSON.parse(response.content).success) {
                    alert("ERROR!" + JSON.stringify(response.content));

                }else{

                    replaceStatusText("The issue has been "+(state == "open" ? "reopened" : "closed") );
                }

            });
        }
        var extPropClosed = JSON.parse(props.github4jiveIssueClosed);

        if(stateAction == "close"){
            if(extPropClosed){
                replaceStatusText("The issue is already closed. Refresh your discussion page.");
            }else{
                changeIssueState("closed");
            }
        }
        else if(stateAction == "reopen") {
            if (extPropClosed) {
                changeIssueState("open");
            }
            else {
                replaceStatusText("The issue is already open. Refresh your discussion page.");
            }
        }else{
            replaceStatusText(function () {
                replaceStatusText("The app is misconfigured. Invalid issue action is defined");
            });
        }

    });



});