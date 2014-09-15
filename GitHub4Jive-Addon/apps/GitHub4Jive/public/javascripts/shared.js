/*
 * This file is included in apps to infer the value of host. The host variable is used
 * to proxy calls through the service.
 */
var host;

if( !host ) {
    var appXMLUrl = gadgets.util.getUrlParameters()['url'];
    if( appXMLUrl ) {
        // parts will look like: ["http:", "", "localhost:8090", "osapp", "todo", "app.xml"]
        var parts  = appXMLUrl.split("/");
        host = parts[0] + "//" + parts[2];
    }
}

