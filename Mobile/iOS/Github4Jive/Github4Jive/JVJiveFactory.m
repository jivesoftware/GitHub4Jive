//
//  JVJiveFactory.m
/*
 Copyright 2014 Jive Software
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* WHAT'S INSIDE:
 * This is our app's interface into the Jive SDK.  We'll define methods here
 * that handle the heavy lifting between our app and Jive.
 * 
 * Of note is logging in, OAuth refreshing, secure credential storage, and
 * image request authentication.
 */


#import "JVJiveFactory.h"
#import "JVOAuthRefresher.h"
#import "JVClientConfig.h"
#import <Jive/JiveHTTPBasicAuthCredentials.h>
#import <UICKeyChainStore.h>

@interface JVJiveFactory () <JiveAuthorizationDelegate>

@property (nonatomic) Jive *jive;
@property (nonatomic) JiveOAuthCredentials *credentials;
@property (nonatomic) JiveMobileAnalyticsHeader *mobileAnalyticsHeader;
@property (nonatomic) JVOAuthRefresher *oauthRefresher;

@property (nonatomic) UICKeyChainStore *keyChainStore;
@property (nonatomic) NSString *communityUrl;


@property (nonatomic) JVClientConfig *clientConfig;
@end


@implementation JVJiveFactory

// Initialize our client, and kick off a version check against the
// Jive instance at the specified url.

- (id)initWithInstanceURL:(NSURL *)instanceURL
                 complete:(JivePlatformVersionBlock)completeBlock
                    error:(JiveErrorBlock)errorBlock {
    self = [super init];
    if (self) {
        self.clientConfig = [JVClientConfig new];
        
        self.jive = [[Jive alloc] initWithJiveInstance:instanceURL
                                 authorizationDelegate:self];
        
        self.keyChainStore = [UICKeyChainStore keyChainStore];
        
        // If requests fail due to invalid OAuth tokens, the Jive SDK will attempt to
        // retry the operation.  JVOAuthRefresher provides a means to handle requesting the
        // OAuth token refresh.
        
        self.oauthRefresher = [[JVOAuthRefresher alloc] initWithJiveFactory:self];
        self.jive.defaultOperationRetrier = self.oauthRefresher;

        [self.jive versionForInstance:instanceURL
                           onComplete:completeBlock
                              onError:errorBlock];
    }
    
    return self;
}

- (void)handleLoginError:(NSError *)error withErrorBlock:(JiveErrorBlock)errorBlockCopy
{
    //Reset the client
    self.jive = [[Jive alloc] initWithJiveInstance:self.jive.jiveInstanceURL authorizationDelegate:self];
    if (errorBlockCopy) {
        errorBlockCopy(error);
    }
}

// Use the  OAuth consumer key and secret provided in the client_config plist, along with the
// user name and password, to attempt to get an OAuth token.

// If we get credentials back, then we should securely store them (see -setCredentials: here).

- (void)loginWithName:(NSString *)userName
             password:(NSString *)password
             complete:(JivePersonCompleteBlock)completeBlock
                error:(JiveErrorBlock)errorBlock {
    JiveErrorBlock errorBlockCopy = [errorBlock copy];

    [self.jive OAuthTokenWithOAuthID:self.clientConfig.jiveOAuthConsumerKey OAuthSecret:self.clientConfig.jiveOAuthConsumerSecret username:userName password:password onComplete:^(JiveOAuthCredentials *credentials) {
        self.communityUrl = [self.jive.jiveInstanceURL absoluteString];
        self.credentials = credentials;
        [self.jive me:^(JivePerson *me) {
            completeBlock(me);
        } onError:^(NSError *error) {
            [self handleLoginError:error withErrorBlock:errorBlockCopy];
        }];
    } onError:^(NSError *error) {
        [self handleLoginError:error withErrorBlock:errorBlockCopy];
    }];
}


// Get the user data for the currently logged in Jive user

- (void)getMe:(JivePersonCompleteBlock)completeBlock error:(JiveErrorBlock)errorBlock {
    [self.jive me:^(JivePerson *me) {
        completeBlock(me);
    } onError:^(NSError *e) {
        errorBlock(e);
    }];
}

// Attempt to send a token revocation request at the server.  This way, when the user logs out,
// they don't have an orphaned entry in their list of authorized apps on the Jive instance.

- (void)logout:(JiveCompletedBlock)completeBlock error:(JiveErrorBlock)errorBlock; {
    [self.jive OAuthRevocationWithOAuthCredentials:self.credentials onComplete:^{
        [self clearCredentials];
        completeBlock();
    } onError:^(NSError *error) {
        [self clearCredentials];
        errorBlock(error);
    }];
}

- (void)clearCredentials {
    self.credentials = nil;
    self.communityUrl = nil;
}

// If the OAuth access token is invalid due to expiry, then attempt to refresh it.

-(void)attemptOAuthRefreshWithCompleteBlock:(JiveCompletedBlock)onComplete onError:(JiveErrorBlock)onError {
    [self.jive OAuthTokenRefreshWithOAuthID:self.clientConfig.jiveOAuthConsumerKey
                                OAuthSecret:self.clientConfig.jiveOAuthConsumerSecret
                               refreshToken:self.credentials.refreshToken
                                 onComplete:^(JiveOAuthCredentials *newCredentials) {
                                     self.credentials = newCredentials;
                                     onComplete();
    } onError:^(NSError *error) {
        onError(error);
    }];
}

-(BOOL)hasCredentialsForCommunity {
    return ([self.communityUrl isEqualToString:[self.jive.jiveInstanceURL absoluteString]] &&
            self.credentials != nil);
}

- (Jive*)jiveInstance {
    return self.jive;
}

// Image requests against the Jive instance need to be authenticated.  This provides a means to
// auth those requests.

- (NSMutableURLRequest *)imageURLRequestForURL:(NSURL *)imageURL {
    NSMutableURLRequest *imageURLRequest = nil;
    if (imageURL) {
        imageURLRequest = [NSMutableURLRequest requestWithURL:imageURL];
        [self applyCredentialsToRequest:imageURLRequest];
    }
    return imageURLRequest;
}

#pragma mark - JiveAuthorizationDelegate methods

- (id<JiveCredentials>)credentialsForJiveInstance:(NSURL *)url {    
    return self.credentials;
}

- (JiveMobileAnalyticsHeader *)mobileAnalyticsHeaderForJiveInstance:(NSURL *)url {
    if (!self.mobileAnalyticsHeader) {
        self.mobileAnalyticsHeader = [[JiveMobileAnalyticsHeader alloc] initWithAppID:@"Github4Jive" // Your custom app id
                                                                           appVersion:[NSString stringWithFormat:@"%1$@ (%2$@)", // The version information from your .plist
                                                                                       [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"],
                                                                                       [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"]]
                                                                       connectionType:@"wifi" // This should be the connection type your device is currently using.
                                                                       devicePlatform:[UIDevice currentDevice].model
                                                                        deviceVersion:[UIDevice currentDevice].systemVersion];
    }
    
    return self.mobileAnalyticsHeader;
}

#pragma mark - Private API

- (void)setCommunityUrl:(NSString *)communityUrl {
    [self.keyChainStore setString:communityUrl forKey:@"communityUrl"];
    [self.keyChainStore synchronize];
}

- (NSString*)communityUrl {
    return [self.keyChainStore stringForKey:@"communityUrl"];
}

// Securely access credentials via the iOS Keychain.

-(void)setCredentials:(JiveOAuthCredentials *)credentials {
    [self.keyChainStore setData:[NSKeyedArchiver archivedDataWithRootObject:credentials] forKey:@"oauthCredentials"];
    [self.keyChainStore synchronize];
}

-(JiveOAuthCredentials*)credentials {
    return [NSKeyedUnarchiver unarchiveObjectWithData:[self.keyChainStore dataForKey:@"oauthCredentials"]];
}

- (void)applyCredentialsToRequest:(NSMutableURLRequest*)request {
    [self.credentials applyToRequest:request];
}



@end
