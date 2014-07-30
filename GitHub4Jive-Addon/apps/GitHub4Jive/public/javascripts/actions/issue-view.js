    $(function() {
        console.log("jQuery onReady...");
            
            
    });

    gadgets.util.registerOnLoadHandler(function() {
        
        console.log("gadgets onLoad...");
            
        opensocial.data.getDataContext().registerListener(
            'org.opensocial.ee.context',
            function(key) {
                var context = opensocial.data.getDataContext().getDataSet(key);
                if (context && context.target && context.target.context && context.target.context) {
                    $('#issueDetails').html(JSON.stringify(context.target.context));
                } // end if
            } // end function
        );

        gadgets.window.adjustHeight(300);
        gadgets.window.adjustWidth(800);
        
    });
