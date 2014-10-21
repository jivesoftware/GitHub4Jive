
$(function () {
    try {
        $('.btn').button();
    }catch(error){
        console.log("Bootstrap js needs to be included", error)
    }
})

jive.tile.onOpen(function (config, options) {

    $("#j-card-authentication").show();
    $("#j-card-action").hide();
    gadgets.window.adjustHeight();

    if(typeof config === "string"){
        config = JSON.parse(config);
        if(typeof config === "string"){
            config = JSON.parse(config);
        }
    }

    $("#issue").text(config.number);
    $("#issueTitle").text(config.title);
    $("#gitHubLink").attr("href", config.url);

    var labelGroup = $("#labels");
    var labelSave = $("#saveLabels");

    function toggleChecked(e){
        function toggleProperty(idx, oldProp) {
            return !oldProp;
        }
        e.prop("checked", toggleProperty);
        e.parent("label").toggleClass("active");
    }

    for(var i = 0; i < config.labels.length; i++){
        var labelInput = $("input[value='"+config.labels[i].name+"']",labelGroup);
        toggleChecked(labelInput);
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
                "&repo=" + config.repo +
                "&number=" + config.number,
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {

            //alert( "status=" + response.status) ;
            var content = JSON.parse(response.content);
            if ((response.status >= 400 && response.status <= 599) || !content.success) {
                osapi.jive.core.container.sendNotification({message: content.message, severity: 'error'});
                //toggleState();
            }else{
                osapi.jive.core.container.sendNotification({message: "Labels have been applied", severity: 'success'});
            }

        });
    })

    $("#btn_exit").click(function () {
        jive.tile.close(null, {});
    });


    $("#btn_close").click(function () {
        // close the issue
        var bodyPayload = {
            "state": "closed"
        };
        osapi.http.post({
            'href': host + '/github/place/changeIssueState?' +      // call endpoint to proxy the close issue signal
                "ts=" + new Date().getTime()+                       // to github, providing this info:
                "&place=" + encodeURIComponent(placeUrl) +          // - jive place identity
                "&repo=" + config.repo +                            // - github repo
                "&number=" + config.number,                         // - girhub issue number
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {

            //alert( "status=" + response.status) ;
            if ((response.status >= 400 && response.status <= 599) || !JSON.parse(response.content).success) {
                alert("ERROR!" + JSON.stringify(response.content));
            }
            jive.tile.close(null, {});
        });

    });  // end btn_close
});