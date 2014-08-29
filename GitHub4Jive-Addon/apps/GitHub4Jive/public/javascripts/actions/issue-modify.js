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
//Code in this block will only occur after authorization has occured
    $(document).bind("github4jiveAuthorized", function () {
        gadgets.window.adjustWidth(800);

        contentObject.getExtProps().execute(function (props) {
            if(props.content){
                props = props.content;
            }
            var openToggle = $("#open");
            var closeToggle = $("#closed");
            var labelGroup = $("#Labels");
            var labelSave = $("#SaveLabels")

            function toggleChecked(e){
                function toggleProperty(idx, oldProp) {
                    return !oldProp;
                }
                e.prop("checked", toggleProperty);
                e.parent("label").toggleClass("active");
            }


            function toggleState(){
                toggleChecked(openToggle);
                toggleChecked(closeToggle);
            }

            if (JSON.parse(props.github4jiveIssueClosed)) {
                toggleState();
            }

            if(props.github4jiveIssueLabels){
                var labels = JSON.parse(props.github4jiveIssueLabels);
                for(var i = 0; i < labels.length; i++){
                    var labelInput = $("input[value='"+labels[i].name+"'",labelGroup);
                    toggleChecked(labelInput);
                }
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
                        toggleState();
                    }

                });
            }

            openToggle.parent().on("click",function () {
                changeIssueState("open");
            });

            closeToggle.parent().on("click",function () {
                changeIssueState("closed");
            });

            labelSave.click(function () {
                var checked =  $("label.active input",labelGroup);
                var labels =[];
                checked.each(function (idx,label) {
                    labels.push( $(label).val());
                });

                console.log(labels);

            })

        });



    });

    $('.btn').button();





});