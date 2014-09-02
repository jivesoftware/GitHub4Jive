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
                    var statusText = $("#Status");
                    statusText.children().hide(500).promise().done( function () {
                        statusText.append("<span>The issue has been "+(state == "open" ? "reopened" : "closed") +"</span>");
                        window.setTimeout(function () {
                            osapi.jive.core.container.closeApp();
                        }, 5000)
                    });
                }

            });
        }
        var extPropClosed = JSON.parse(props.github4jiveIssueClosed);
        if (!extPropClosed && stateAction == "close") {
            changeIssueState("closed");
        }else if(extPropClosed && stateAction == "reopen"){
            changeIssueState("open");
        }else{
            alert("Invalid Action");
        }

    });



});