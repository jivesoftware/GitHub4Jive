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
                statusText.append(appendage);
                statusText.after("<br/><p>The page will reload soon unless you close this app. You will be able to recover a comment in progress.</p>")
                window.setTimeout(function () {
                    top.location.reload();
                }, 5000);
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

                    replaceStatusText("<span>The issue has been "+(state == "open" ? "reopened" : "closed") +"</span>");
                }

            });
        }
        var extPropClosed = JSON.parse(props.github4jiveIssueClosed);

        if(stateAction == "close"){
            if(extPropClosed){
                replaceStatusText("<span>The issue is already closed. Refresh your discussion page.</span>");
            }else{
                changeIssueState("closed");
            }
        }
        else if(stateAction == "reopen") {
            if (extPropClosed) {
                changeIssueState("open");
            }
            else {
                replaceStatusText("<span>The issue is already open. Refresh your discussion page.</span>");
            }
        }else{
            replaceStatusText(function () {
                replaceStatusText("<span>The app is misconfigured. Invalid issue action is defined</span>");
            });
        }

    });



});