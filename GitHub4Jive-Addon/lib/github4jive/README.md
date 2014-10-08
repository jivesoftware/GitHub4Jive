GitHub for Jive - Developer Notes
=================================

Please use this directory to house code that can be used between integration pieces.
Ex: GitHubFacade provides a nice abstraction on the GitHub Api and produces a consistent
API for tiles, apps, services, etc to access uniformly.

Please use <a href="https://github.com/kriskowal/q">Q.js promises</a> to manage asynchronous operations.

The [Jive-SDK](https://cdn.rawgit.com/jivesoftware/jive-sdk/master/docs/api/module-api.html) is used extensively in this module.

Class interfaces
================

These modules need to be imported with require and then use new to create a new instance.
When importing them the name used to reference the constructor should start with a capital.

JiveApiFacade
-------------

the JiveApiFacade class requires a community object from the jive.community namespace and an 
Authenticator. The possible authenticators are JiveBasicAuth and JiveOauth described below.

This class is a not a full implementation of the Jive v3 api. Instead it encapsulates just what is
needed for the GitHub4Jive Project. 

JiveBasicAuth
-------------

The JiveBasicAuth class takes the username and password of a user and stores the password 
encrypted in memory. An authentication header is then added when the applyTo function is called
from the JiveApiFacade.

NOTE: Some apis (webhooks and external props among others) require OAuth. Using this authenticator
is not recommended for production.

JiveOauth
----------

The nature of this project ties configuration to a place. To make the refresh token flow easier, the
JiveOAuth class is not generic. It takes a placeUrl that is used to identify which record in the placeStore
should be modified with the new access_token. 

The constructor also takes the current access_token and refresh_token to use for requests.

The applyTo function simply returns an object with an oauth member that is used in the jive.community.dorequest
function.

Singleton Interfaces
====================

These interfaces do not require new. When imported they should start with a lower case letter.

gitHubFacade
------------

Similarly to the JiveApiFacade, the gitHubFacade singleton is not a full feature facade. Instead 
it encapsulates only necessary functionality. It was implemented as a singleton because of the webhook
event handling implementation requires synchronous operations between setup calls. A instance structure would
complicate it. There is also only one GitHub but there are multiple Jive instances.

As a result all calls to the facade need to have repo and authentication information passed in.

In order for the GitHub webhooks to work, a url endpoint must receive posts at the githubwebhookurl specified in
the jiveclientconfiguration.json. That endpoint must then call notifyNewGitHubHookInfo function and pass the 
payload data into it. Currently, this is done by the gitHubController in the services directory.


placeStore
-----------

The placeStore singleton stores and retrieves configuration for a given place. It wraps the jive.service.persistence
namespace. Places are stored by their full api url to ensure uniqueness across Jive instances. Each record contains a 
jive and github member for corresponding oauth configurations among other things. At the global level there a few useful
members to identify the record. These include: jiveUrl, placeUrl, and placeID. invalidCache is a flag that is set to true
whenever save is called. Currently, this triggers the store to grab external properties from the place when it is retrieved
from the store. This could easily be extended to grab other information and store it in the record itself as a cache.

tileFormatter
-------------

The tileFormatter singleton handles formatting of tile data to be pushed into tiles. Many functions take a keys object
which is a simply mapping of tile data member names to domain object members. 

Ex: Each table tile entry can have a name, value, and url member. If our domain object looked something like this

    {
        stat: "Average",
        value: 123.4
    }
    
then the keys object would look like this

    {
        name: "stat"
    }
    
This maps the stat member of our domain object to the name member needed on the tile data object. And because value is the same
as what tile expects no mapping is necessary.

Note: if the domain object has all the of the same members that are needed for the tile than the keys object can be omitted
