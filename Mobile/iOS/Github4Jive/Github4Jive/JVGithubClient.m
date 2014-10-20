//
//  JVGithubClient.m
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

#import "JVGithubClient.h"
#import "JVClientConfig.h"
#import <GTMOAuth2ViewControllerTouch.h>
#import <GTMOAuth2Authentication.h>
#import <AFNetworking.h>
#import <Mantle.h>

static NSString* const GH_KEYCHAIN_KEY=@"Github4Jive";
static NSString* const GH_AUTH_URL=@"https://github.com/login/oauth/authorize";
static NSString* const GH_TOKEN_URL=@"https://github.com/login/oauth/access_token";
static NSString* const GH_SP_KEY=@"Github";

static NSString* const JVGithubClientMyUserInfoUrl = @"https://api.github.com/user";
static NSString* const JVGithubClientMyReposUrl = @"https://api.github.com/user/repos";
static NSString* const JVGithubClientRepoCollaboratorsUrlFormat = @"https://api.github.com/repos/%@/%@/collaborators";
static NSString* const JVGithubClientRepoCollaboratorsMutateUrlFormat = @"https://api.github.com/repos/%@/%@/collaborators/%@";

static NSString* const JVGithubClientSearchUserByEmailUrlFormat = @"https://api.github.com/search/users?q=in:email+%@";


@interface JVGithubClient()

@property (nonatomic) JVClientConfig *clientConfig;
@property (nonatomic) GTMOAuth2Authentication *authentication;


@end

@implementation JVGithubClient

-(id)init {
    self = [super init];
    if (self) {
        self.clientConfig = [JVClientConfig new];
    }
    return self;
}

#pragma mark - Keychain access

-(BOOL)maybeAlreadyLoggedIn {
    NSError *error;
    GTMOAuth2Authentication *authentication = [self customGithubAuth];
    
    BOOL didAuth = [GTMOAuth2ViewControllerTouch authorizeFromKeychainForName:GH_KEYCHAIN_KEY authentication:authentication error:&error];
    
    if (error != nil) {
        NSLog(@"Errror checking keychain for auth");
    }
    
    if (didAuth) {
        self.authentication = authentication;
    }
    return didAuth;
}

-(void)logout {
    [GTMOAuth2ViewControllerTouch removeAuthFromKeychainForName:GH_KEYCHAIN_KEY];
}

#pragma mark - Login Controller


-(GTMOAuth2ViewControllerTouch*)oauthViewControllerWithSuccess:(void(^)(void))onSuccess onError:(void(^)(NSError*))onError {
    
    GTMOAuth2Authentication *customAuth = [self customGithubAuth];
    NSURL *authURL = [NSURL URLWithString:GH_AUTH_URL];
    
    GTMOAuth2ViewControllerTouch *oauthViewController = [[GTMOAuth2ViewControllerTouch alloc] initWithAuthentication:customAuth
                                                authorizationURL:authURL
                                                keychainItemName:GH_KEYCHAIN_KEY completionHandler:^(GTMOAuth2ViewControllerTouch *viewController, GTMOAuth2Authentication *auth, NSError *error) {
                                                    if (error != nil) {
                                                        onError(error);
                                                    } else {
                                                        self.authentication = auth;
                                                        onSuccess();
                                                    }
                                                }];
    
    return oauthViewController;
}


#pragma mark - User fetch

-(void)getMyUserInfo:(void(^)(JVGithubUser*))onSuccess onError:(void(^)(NSError *))errorCallback {
    [self processWithAuthenticatedUrl:[NSURL URLWithString:JVGithubClientMyUserInfoUrl] method:@"GET" completion:^(id JSON) {
        NSError *error = nil;
        JVGithubUser *user = [MTLJSONAdapter modelOfClass:JVGithubUser.class fromJSONDictionary:JSON error:&error];
        
        if (error != nil) {
            errorCallback(error);
        } else {
            onSuccess(user);
        }
    } onError:^(NSError *error) {
        errorCallback(error);
    }];
}

-(void)searchUsersByEmail:(NSString*)email onSuccess:(void(^)(NSArray*))successCallback onError:(void(^)(NSError *))errorCallback {
    
    NSString *urlString = [NSString stringWithFormat:JVGithubClientSearchUserByEmailUrlFormat, email];
    
    [self processWithAuthenticatedUrl:[NSURL URLWithString:urlString] method:@"GET" completion:^(id JSON) {
        NSError *error = nil;
        NSArray *users = [MTLJSONAdapter modelsOfClass:JVGithubUser.class fromJSONArray:[JSON objectForKey:@"items"] error:&error];
        
        if (error != nil) {
            errorCallback(error);
        } else {
            successCallback(users);
        }
    } onError:^(NSError *error) {
        errorCallback(error);
    }];
}

#pragma mark - User repo fetch

-(void)getMyRepos:(void(^)(NSArray*))successCallback onError:(void(^)(NSError*))errorCallback {
    [self processWithAuthenticatedUrl:[NSURL URLWithString:JVGithubClientMyReposUrl] method:@"GET" completion:^(id JSON) {
        NSError *error = nil;
        NSArray *repos = [MTLJSONAdapter modelsOfClass:JVGithubRepo.class fromJSONArray:JSON error:&error];
        
        if (error != nil) {
            errorCallback(error);
        } else {
            successCallback(repos);
        }
    } onError:^(NSError *error) {
        errorCallback(error);
    }];

}

#pragma mark - Repo collaborators

-(void)getCollaboratorsForRepo:(JVGithubRepo*)repo owner:(JVGithubUser*)owner onSuccess:(void(^)(NSArray*))successCallback onError:(void(^)(NSError*))errorCallback {
    NSString* urlString = [NSString stringWithFormat:JVGithubClientRepoCollaboratorsUrlFormat, owner.login, repo.name];
    
    [self processWithAuthenticatedUrl:[NSURL URLWithString:urlString] method:@"GET" completion:^(id JSON) {
        NSError *error = nil;
        NSArray *users = [MTLJSONAdapter modelsOfClass:JVGithubUser.class fromJSONArray:JSON error:&error];
        
        if (error != nil) {
            errorCallback(error);
        } else {
            successCallback(users);
        }

    } onError:^(NSError *error) {
        errorCallback(error);
    }];}

-(void)addCollaborator:(JVGithubUser*)collaborator toRepo:(JVGithubRepo*)repo ownerName:(JVGithubUser*)owner onSuccess:(void(^)(void))successCallback onError:(void(^)(NSError*))errorCallback {
    NSString* urlString = [NSString stringWithFormat:JVGithubClientRepoCollaboratorsMutateUrlFormat, owner.login, repo.name, collaborator.login];
    
    [self processWithAuthenticatedUrl:[NSURL URLWithString:urlString] method:@"PUT" completion:^(id JSON) {
        successCallback();
    } onError:^(NSError *error) {
        errorCallback(error);
    }];
}

-(void)removeCollaborator:(JVGithubUser*)collaborator toRepo:(JVGithubRepo*)repo ownerName:(JVGithubUser*)owner onSuccess:(void(^)(void))successCallback onError:(void(^)(NSError*))errorCallback {
    NSString* urlString = [NSString stringWithFormat:JVGithubClientRepoCollaboratorsMutateUrlFormat, owner.login, repo.name, collaborator.login];
    
    [self processWithAuthenticatedUrl:[NSURL URLWithString:urlString] method:@"DELETE" completion:^(id JSON) {
        successCallback();
    } onError:^(NSError *error) {
        errorCallback(error);
    }];
}

#pragma mark - Private API


- (void)viewController:(GTMOAuth2ViewControllerTouch *)viewController
      finishedWithAuth:(GTMOAuth2Authentication *)auth
                 error:(NSError *)error {
    
}

-(void)processWithAuthenticatedUrl:(NSURL*)URL method:(NSString*)method completion:(void(^)(id))onSuccess onError:(void(^)(NSError *))onError {
    NSMutableURLRequest *requestToAuth = [[NSMutableURLRequest alloc] initWithURL:URL cachePolicy:NSURLRequestReloadIgnoringCacheData
                                                                  timeoutInterval:0];
    
    [requestToAuth setHTTPMethod:method];
    [self.authentication authorizeRequest:requestToAuth
                        completionHandler:^(NSError *authError) {
                            if (authError != nil) {
                                onError(authError);
                            } else {
                                AFJSONRequestOperation *operation =
                                [AFJSONRequestOperation JSONRequestOperationWithRequest:requestToAuth success:^(NSURLRequest *request, NSHTTPURLResponse *response, id JSON) {
                                    onSuccess(JSON);
                                } failure:^(NSURLRequest *request, NSHTTPURLResponse *response, NSError *error, id JSON) {
                                    onError(error);
                                }];
                                [operation start];
                            }
                        }];

}


- (GTMOAuth2Authentication *)customGithubAuth {
    
    NSURL *tokenURL = [NSURL URLWithString:GH_TOKEN_URL];
    
    // We'll make up an arbitrary redirectURI.  The controller will watch for
    // the server to redirect the web view to this URI, but this URI will not be
    // loaded, so it need not be for any actual web page.
    NSString *redirectURI = @"jwdemo://jwlogin";
    
    GTMOAuth2Authentication *auth;
    auth = [GTMOAuth2Authentication authenticationWithServiceProvider:GH_SP_KEY
                                                             tokenURL:tokenURL
                                                          redirectURI:redirectURI
                                                             clientID:self.clientConfig.githubOAuthConsumerKey
                                                         clientSecret:self.clientConfig.githubOAuthConsumerSecret];
    auth.scope = @"user,repo";

    return auth;
}



@end
