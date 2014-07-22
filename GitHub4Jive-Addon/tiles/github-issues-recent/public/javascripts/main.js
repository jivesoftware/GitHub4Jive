
(function() {
    jive.tile.onOpen(function(config, options ) {
        gadgets.window.adjustHeight();

        if ( typeof config === "string" ) {
            config = JSON.parse(config);
        }

        var json = config || {
            "organization" : "" ,
            "repository" : ""
        };

        // prepopulate the sequence input dialog
        $("#repository").val( json["repoFullname"]);

        $("#btn_submit").click( function() {
            var fullName = $("#repository").val();
            var parts = fullName.split("/");
            var owner = parts[0];
            var repoName = parts[1];
            config["repoFullName"] = fullName;
            config["repoOwner"] = owner;
            config["repoName"] = repoName;
            jive.tile.close(config, {} );
            gadgets.window.adjustHeight(300);
        });
    });

})();

