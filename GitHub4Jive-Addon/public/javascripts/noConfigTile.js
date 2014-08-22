$(function () {
    jive.tile.onOpen(function(config, options ) {
        $(document).bind("github4jiveConfigDone",function () {
            jive.tile.close(config, {});
        });
    });
});
