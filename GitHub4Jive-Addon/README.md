# GitHub4Jive - Add-on Developer Notes

## Prerequisites

Before running, follow these instructions:

1. You need to be able to install add-ons on the Jive server being used for this tutorial. Registered developers can use the [Jive Developer Sandbox](https://sandbox.jiveon.com/), which has the sandbox property turned on.
2. Your development system must be accessible to the Jive server. Consider using a cloud-based IDE (such as [Nitrous.IO](https://www.nitrous.io/)) for this tutorial.


## Instructions

The following instructions should help you get the GitHub4Jive project onto the [developer sandbox](https://sandbox.jiveon.com) for testing.

1.  Determine the hostname for your service. All subsequent references to `SERVICE_HOSTNAME` should be replaced with this hostname. If you are using [Nitrous.IO](https://www.nitrous.io/), you can determine the hostname by selecting any **Port** submenu item from the **Preview** menu. When recording the hostname, be sure to omit the port number and do not include a terminating backslash (/).<br />
    For example: `https://blazing-example-12345.usw1-2.nitrousbox.com`
1.  Clone the [GitHub4Jive](https://github.com/jivesoftware/GitHub4Jive) repository.<br/>
    `git clone https://github.com/jivesoftware/GitHub4Jive.git`
1.  Change to the add-on subdirectory.<br/>
    `cd GitHub4Jive/GitHub4Jive-Addon`
1.  Update your Node.js dependencies.<br/>
    `npm update`
1.  Update the `clientUrl` property in the `jiveclientconfiguration.json` file, which can be found in the `GitHub4Jive-Addon` subdirectory. If you are using Nitrous.IO, refresh the file browser panel before browsing for this file.<br/>
    `"clientUrl": "http://SERVICE_HOSTNAME",`<br/>
    Remember to replace the `SERVICE_HOSTNAME` value with whatever you got from the first step.
1.  (Optional) Change the `name` property value to something more personalized.<br/>
    `"name": "My Personalized GitHub4Jive Project Name",`
1.  Authorize your service's use of the GitHub API using your GitHub account.
    1.  Log in to [GitHub](https://github.com).
    2.  From the GitHub settings, register a [new developer application](https://github.com/settings/applications/new).
    3.  Choose a recognizable `Application name`.
    4.  Set the home page URL to any URL. This URL will be accessible from within the Jive place you will create.
    5.  Set the `Authorization call URL` to the following URL:<br/>
        `http://SERVICE_HOSTNAME:8090/github/oauth/callback`<br/>
        Remember to replace the `SERVICE_HOSTNAME` value with whatever you got from the first step.
    6.  Click **Register application**.
1.  Grab the Client ID and the Client Secret specified in the GitHub application page and fill in the OAuth key and secret within the `jiveclientconfiguration.json` file.<br/>
        `"oauth2ConsumerKey": "GITHUB_APP_CLIENT_ID",`<br/>
        `"oauth2ConsumerSecret": "GITHUB_APP_CLIENT_SECRET",`<br/>
    Replace the `GITHUB_APP_CLIENT_ID` with the GitHub Client ID and `GITHUB_APP_CLIENT_SECRET` with the GitHub Client Secret.
1.  Start your GitHub4Jive service.<br />
    `node app.js`
1.  Download the `extension.zip` file produced from starting your service. (If you are using Nitrous.IO, refresh the file browser panel before browsing for this file. Right click on the file and select **Download "extension.zip"**.)
1.  Navigate to [https://sandbox.jiveon.com/addon-services!input.jspa](https://sandbox.jiveon.com/addon-services!input.jspa) in the Jive Sandbox to install your newly created add-on.
1.  Upload the `extension.zip` file that you just downloaded.

You can now create a group or project within the Jive Sandbox and select the GitHub4Jive place template (found within the *Other* category) to get started.

##To develop and test the cartridge you must add

    "type": "jab-cartridges-app" 
    
to the extensionInfo object in jiveclientconfiguration.json. Otherwise, the SDK will not package the cartridge into the add-on.
This was done so that those that have access to upload a cartridge can and those that don't are not hung up.