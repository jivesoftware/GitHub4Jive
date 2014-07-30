    $(function() {
        console.log("jQuery onReady...");
            
        $('#insertGitHubIssue').click(function(e){

                if ($('#insertGitHubIssue').hasClass('disabled')) {
                        return;
                } // end if

                $('#insertGitHubIssue').addClass('disabled');

                var imageUrl = $('#logo').attr('src');
                var serverRoot = gadgets.config.get()['jive-opensocial-ext-v1']['jiveUrl'];
                imageUrl = imageUrl.replace('//' + serverRoot.split('//')[1], serverRoot);

                osapi.jive.core.container.closeApp({
                        data:{
                                display: {
                                        type:"text",
                                        icon: imageUrl,
                                        label: $('#gitHubIssueURI').val()
                                },
                                target: {
                                        type: "embed",
                                        view: "github4jive-issue-view",
                                        context: {
                                                uri: $('#gitHubIssueURI').val()
                                        }
                                }
                        }
                });

        }); 
            
    });

    gadgets.util.registerOnLoadHandler(function() {
        
        console.log("gadgets onLoad...");

        gadgets.window.adjustHeight();
        gadgets.window.adjustWidth();
        
    });
