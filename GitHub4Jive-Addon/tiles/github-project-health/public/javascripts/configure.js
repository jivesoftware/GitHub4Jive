(function() {
    jive.tile.onOpen(function(config, options ) {
        gadgets.window.adjustHeight();

        if ( typeof config === "string" ) {
            config = JSON.parse(config);
        }
        var json = config || {
            "set_level": "1"
        };

        // prepopulate the sequence input dialog
        $("#set_level").val( json["set_level"]);

        $(document).bind("github4jiveConfigDone",function () {
            config["set_level"] = $("#set_level").val();
            jive.tile.close(config, {} );
        });
    });

})();

