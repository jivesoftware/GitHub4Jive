#Github4Jive Mobile

These are the demo projects for the [Jive Mobile SDK – Deliver Integrated Mobile Experiences with iOS & Android](https://jiveworld.jivesoftware.com/tracks/sessions/mobile-sdk-android-ios/) presentation being 
delivered at JiveWorld14 on Wednesday, October 22.

The projects act as a demonstration of a Jive SDK mobile integration with an external service.  The demo app
allows you to log into a Jive instance, and see a mashup of your Jive and Github user info.  You can add
collaborators to your Github repositories based upon those who you connect with in Jive.  If your Jive friend
has a publicly listed email address in Github, you can add that person as a collaborator to your repos.

The projects also act as a demonstration of how to sign into a Jive instance using OAuth on both iOS
and Android, and how to do some simple interactions.

## Building & Running

### iOS

Because this project uses CocoaPods, you'll want to open `Github4Jive.xcworkspace` instead of the XCode
project directly.

### Android

TBA

##Requirements

These applications require either a current Jive Cloud instance, or hosted/on-prem version 7.0.1 or later.

In order for these project to authenticate against a Jive instance, you'll need to install the provided 
mobile addon into your Jive instance.

## Limitations

The iOS app does not currently do any paging of Github or Jive results. If you have more than 30 repos, or 25 
Jive connections, you will only see the first 30.  Sorry!

## Developer Challenge Exercise

For an extra bit of learning, see if you can modify the project to list _all_ Jive users, not your followers.  
Implement infinite scrolling to pull down paged results from the Jive server.

__Hint__:  Searching people for "*" displays all people.
