var jive = require('jive-sdk');
var gitHubFacade = require("../../../common/GitHubFacade");

exports.onBootstrap = function(app) {

    //temporary
    var auth = {type:"basic", username:"", password: ""}
    gitHubFacade.subscribeToRepoEvent("jivesoftware", "GitHub4Jive", gitHubFacade.Events.Issue, auth, function(payload){
        console.log(payload);
    });


    // create a metawebhook when a jive instance registers
//    jive.events.addLocalEventListener( 'registeredJiveInstanceSuccess', function( community ) {
//        console.log("registering webhook for", community);
//        jive.webhooks.register(
//            community['jiveCommunity'],
//            'webhook',
//            undefined,
//            jive.service.serviceURL() + '/webhooks'
//        );
//    } );

};

