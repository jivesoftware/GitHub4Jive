function handleContext(context) {
        if(context && context.jive){

                osapi.jive.corev3.resolveContext(context, function(result){
                        result.content.getExtProps().execute(function( props ) {
                                var enabled = "true" ===  props.content.github4jiveEnabled;
                                $("#github4jive-enabled").prop("checked", enabled);
                        });
                });
                console.log('gadget:'+$("#github4jive-enable-submit").size());
                $("#github4jive-enable-submit").click(function() {
                        console.log('clicked');
                        osapi.jive.corev3.resolveContext(context, function(result){
                                console.log('resolveContext callback');
                                if(result.content){
                                        console.log('context has content callback');
                                        result.content.createExtProps({
                                                "github4jiveEnabled": $("#github4jive-enabled").is(':checked')
                                        }).execute(function (resp) {
                                                console.log('resp: {'+JSON.stringify(resp)+'}');
                                                osapi.jive.core.container.closeApp();
                                        });
                                }
                        });
                }); 
        }
}

gadgets.util.registerOnLoadHandler(function() {
        
        gadgets.actions.updateAction({
                id:"com.jivesoftware.addon.github4jive.group.config",
                callback: handleContext
        });
        gadgets.actions.updateAction({
                id:"com.jivesoftware.addon.github4jive.project.config",
                callback: handleContext
        });
        gadgets.actions.updateAction({
                id:"com.jivesoftware.addon.github4jive.space.config",
                callback: handleContext
        });
});

$(function() {
        console.log('jQuery:'+$("#github4jive-enable-submit").size());
});



