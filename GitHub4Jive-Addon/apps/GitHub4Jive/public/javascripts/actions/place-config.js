var app = {

  currentView : gadgets.views.getCurrentView().getName(),
  currentViewerID : -1,
  initGadget : function() {
        console.log('initGadget ...');
    
//         gadgets.actions.updateAction({
//                 id:"com.jivesoftware.addon.github4jive.group.config",
//                 callback: handleContext
//         });
    
//         gadgets.actions.updateAction({
//                 id:"com.jivesoftware.addon.github4jive.project.config",
//                 callback: handleContext
//         });
    
//         gadgets.actions.updateAction({
//                 id:"com.jivesoftware.addon.github4jive.space.config",
//                 callback: handleContext
//         });


      console.log('getViewer test ...');
      osapi.people.getViewer().execute( function(data) {
          console.log('getViewer returned ...');
           if (!data.error) {
             app.currentViewerID = data.id;
             $('#github4jive-github-authorize').slideDown('fast',function() {});
           } // end if
        });
  },
  
  initjQuery : function() {
    console.log('initjQuery ...');
    $('#github4jive-github-authorize').click(function() {

        //TODO: UN-HARD CODE
        var BACKEND_HOST = "http://speedy-thunder-87-131578.use1-2.nitrousbox.com:8090";

        osapi.http.get({
          href: BACKEND_HOST+'/github/oauth/authorize?viewerID='+app.currentViewerID,
          format: 'json',
          headers: {"Content-Type":["application/json"]},
          'authz': 'signed'
        }).execute(function(res) {
          if(res.status >= 200 && res.status <=299 && res.content.url) {
            window.open(res.content.url, "GitHubAuthorize", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");
          } else {
            console.log('errors processing request', res);
          }
        });
      });
  },
  
  handleContext : function(context) {
      console.log('handleContext ...');
    
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
  },
  
  
}

gadgets.util.registerOnLoadHandler(gadgets.util.makeClosure(app, app.initGadget));

$(function() {
  app.initjQuery();
});

