/**
 * Created by glen.nicol on 8/19/14.
 */
$(function () {
    $(".btn").button();

    jive.tile.onOpen(function(config, options ) {

        $("#j-card-authentication").show();
        $("#j-card-configuration").hide();
        gadgets.window.adjustHeight();

        if(typeof config === "string"){
            config = JSON.parse(config);
            if(typeof config === "string"){
                config = JSON.parse(config);
            }
        }

        // prepopulate the sequence input dialog
        var posting = config.posting || "off";
        $("#activityToggle ."+posting).addClass("active");

        $(document).bind("github4jiveConfigDone",function () {
            var status = $("#activityToggle .active input").val();
            var toReturn = {
                "posting"  : status

            };

            jive.tile.close(toReturn);
        });

    });

});