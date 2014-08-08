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

        //TODO: UN-HARD CODE BY PUTTING INTO APP-DATA DURING APP INSTALLATIONgit
        var BACKEND_HOST = "http://speedy-thunder-87-131578.use1-2.nitrousbox.com:8090";

        osapi.http.get({
          href: BACKEND_HOST+'/github/oauth/authorize?viewerID='+app.currentViewerID,
          format: 'json',
          headers: {"Content-Type":["application/json"]},
          noCache: true,
          authz: 'signed'
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
                              if ("true" ===  props.content.github4jiveEnabled) {
                                console.log('initializing UI for already configured place');
                              } else {
                                console.log('initializing UI for UNconfigured place');
                              }
                        });
                });
                console.log('gadget:'+$("#github4jive-enable-submit").size());
                $("#github4jive-enable-submit").click(function() {
                        console.log('clicked');
                        osapi.jive.corev3.resolveContext(context, function(result){
                                console.log('resolveContext callback');
                                if(result.content){
                                        console.log('context has content callback');
                                        //TODO: BULLET-PROOF/UN HARD CODE THE LOGIC HERE, REVISIT ONCE THE FLOW IS BETTER BAKED - RR
                                        result.content.createExtProps({
                                                "github4jiveEnabled": true,
                                                "github4jiveAccessToken": $("#github-authorize-token").val()
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

