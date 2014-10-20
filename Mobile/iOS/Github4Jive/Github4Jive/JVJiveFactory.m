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


- (id)initWithInstanceURL:(NSURL *)instanceURL
                 complete:(JivePlatformVersionBlock)completeBlock
                    error:(JiveErrorBlock)errorBlock {
    self = [super init];
    if (self) {
        self.clientConfig = [JVClientConfig new];
        
        self.jive = [[Jive alloc] initWithJiveInstance:instanceURL
                                 authorizationDelegate:self];
        
        self.keyChainStore = [UICKeyChainStore keyChainStore];
        
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

- (void)getMe:(JivePersonCompleteBlock)completeBlock error:(JiveErrorBlock)errorBlock {
    [self.jive me:^(JivePerson *me) {
        completeBlock(me);
    } onError:^(NSError *e) {
        errorBlock(e);
    }];
}

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
    return ([self.communityUrl isEqualToString:[self.jive.jiveInstanceURL absoluteString]]);
}

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

- (void)setCommunityUrl:(NSString *)communityUrl {
    [self.keyChainStore setString:communityUrl forKey:@"communityUrl"];
    [self.keyChainStore synchronize];
}

- (NSString*)communityUrl {
    return [self.keyChainStore stringForKey:@"communityUrl"];
}

- (Jive*)jiveInstance {
    return self.jive;
}

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
        self.mobileAnalyticsHeader = [[JiveMobileAnalyticsHeader alloc] initWithAppID:@"Example Jive iOS SDK app" // Your custome app id
                                                                           appVersion:[NSString stringWithFormat:@"%1$@ (%2$@)", // The version information from your .plist
                                                                                       [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"],
                                                                                       [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"]]
                                                                       connectionType:@"wifi" // This should be the connection type your device is currently using.
                                                                       devicePlatform:[UIDevice currentDevice].model
                                                                        deviceVersion:[UIDevice currentDevice].systemVersion];
    }
    
    return self.mobileAnalyticsHeader;
}

@end
