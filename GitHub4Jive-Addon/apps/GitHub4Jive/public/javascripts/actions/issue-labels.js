$(function () {
    $("#btn_exit").click(function () {
        osapi.jive.core.container.closeApp();
    });
//Code in this block will only occur after authorization has occured
    $(document).bind("github4jiveAuthorized", function () {
        gadgets.window.adjustWidth(500);

        contentObject.getExtProps().execute(function (props) {
            if(props.content){
                props = props.content;
            }

            var labelGroup = $("#labels");
            var labelSave = $("#saveLabels")

            function toggleChecked(e){
                function toggleProperty(idx, oldProp) {
                    return !oldProp;
                }
                e.prop("checked", toggleProperty);
                e.parent("label").toggleClass("active");
            }


            $("#issueNumber").html(props.github4jiveIssueNumber);
            var matches = contentObject.subject.match(/\[[\w-\/]*\](.*)/);
            $("#issueTitle").html(matches[1]);

            if(props.github4jiveIssueLabels){
                var labels = JSON.parse(props.github4jiveIssueLabels);
                for(var i = 0; i < labels.length; i++){
                    var labelInput = $("input[value='"+labels[i].name+"'",labelGroup);
                    toggleChecked(labelInput);
                }
            }

            labelSave.click(function () {
                var checked =  $("label.active input",labelGroup);
                var labels =[];
                checked.each(function (idx,label) {
                    labels.push( $(label).val());
                });

                console.log(labels);
                var bodyPayload = {
                    "labels": labels
                };
                osapi.http.post({
                    'href': host + '/github/place/changeIssueLabels?' +
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
                        //toggleState();
                    }else{
                        osapi.jive.core.container.closeApp();
                    }

                });
            })

        });



    });

    $('.btn').button();





});