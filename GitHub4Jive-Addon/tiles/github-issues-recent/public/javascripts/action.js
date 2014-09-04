
$(function () {
    try {
        $('.btn').button();
    }catch(error){
        console.log("Bootstrap js needs to be included", error)
    }
})

function populateCommentsTable(repo, issueNumber) {
    // get the data ...
    var bodyPayload = { body: ""};

    osapi.http.get({
        'href': host + '/github/place/comments?' +
            "ts=" + new Date().getTime() +
            "&place=" + encodeURIComponent(placeUrl) +
            "&repo=" + repo +
            "&number=" + issueNumber,
        headers: { 'Content-Type': ['application/json'] },
        'noCache': true,
        'authz': 'signed'
    }).execute(function (response) {
        if (response.status >= 400 && response.status <= 599) {
            alert("ERROR (get comments)!" + JSON.stringify(response.content));
        } else {
            var items = [];
            var body = response.content;
            var json = JSON.parse(response.content);
            console.log("number of comments=" + json.length);

            if (json && json.length) {
                var count = json.length;
                json.forEach(function (comment) {
                    if (count-- <= 5) {
                        var d = new Date(comment.updated_at);
                        var dt = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " "
                            + d.getHours() + ":" + d.getMinutes();
                        items.push('<tr><td>&nbsp' + comment.body + '&nbsp</td><td>&nbsp' + comment.user.login +
                            '&nbsp</td><td>&nbsp' + dt + '&nbsp</td></tr>');
                    }
                });
            } else {
                items.push('<tr><td>---</td><td>---</td><td>---</td></tr>');
            }
            $("#comments-table tr").remove();
            $("#comments-table").append(items.join(''));

            gadgets.window.adjustHeight();
        }
    });
}

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
            if ((response.status >= 400 && response.status <= 599) || !JSON.parse(response.content).success) {
                alert("ERROR!" + JSON.stringify(response.content));
                //toggleState();
            }

        });
    })

    $(document).on("github4jiveAuthorized",function(){
        populateCommentsTable(config.repo, config.number);
    });

    $("#btn_submit").click(function () {
        jive.tile.close(null, {});
    });


    $("#btn_close").click(function () {
        // close the issue

        var bodyPayload = {
            "state": "closed"
        };
        osapi.http.post({
            'href': host + '/github/place/changeIssueState?' +
                "ts=" + new Date().getTime()+
                "&place=" + encodeURIComponent(placeUrl) +
                "&repo=" + config.repo +
                "&number=" + config.number,
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



    $("#btn_comment").click(function () {
        var comment = $("#comment").val();
        if (comment.length == 0) {
            // really need to trim up comment and such before doing all of this, but this is first pass!
            alert("can't post an empty comment");
            return;
        }

        var bodyPayload = { newComment: comment};
        osapi.http.post({
            'href': host + '/github/place/newComment?' +
                "ts=" + new Date().getTime() +
                "&place=" + encodeURIComponent(placeUrl) +
                "&repo=" + config.repo +
                "&number=" + config.number,
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {
            if (response.status >= 400 && response.status <= 599) {
                alert("ERROR (comment post)!" + JSON.stringify(response.content));
            }
            else {
                $("#comment").val("");       // clear out the comment ...
                populateCommentsTable( config.repo, config.number);
            }
        });
    }); // end btn_comment




});
