//
//  JVGithubClient.h
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

#import <Foundation/Foundation.h>
#import <GTMOAuth2ViewControllerTouch.h>

#import "JVGithubUser.h"
#import "JVGithubRepo.h"

@interface JVGithubClient : NSObject

-(GTMOAuth2ViewControllerTouch*)oauthViewControllerWithSuccess:(void(^)(void))success onError:(void(^)(NSError*))error;
-(void)getMyUserInfo:(void(^)(JVGithubUser*))onSuccess onError:(void(^)(NSError *))errorCallback;
-(void)searchUsersByEmail:(NSString*)email onSuccess:(void(^)(NSArray*))onSuccess onError:(void(^)(NSError *))errorCallback;

-(void)getMyRepos:(void(^)(NSArray*))onSuccess onError:(void(^)(NSError*))errorCallback;


-(void)getCollaboratorsForRepo:(JVGithubRepo*)repo owner:(JVGithubUser*)owner onSuccess:(void(^)(NSArray*))successCallback onError:(void(^)(NSError*))errorCallback;
-(void)addCollaborator:(JVGithubUser*)collaborator toRepo:(JVGithubRepo*)repo ownerName:(JVGithubUser*)owner onSuccess:(void(^)(void))successCallback onError:(void(^)(NSError*))errorCallback;
-(void)removeCollaborator:(JVGithubUser*)user toRepo:(JVGithubRepo*)repo ownerName:(JVGithubUser*)owner onSuccess:(void(^)(void))successCallback onError:(void(^)(NSError*))errorCallback;

-(BOOL)maybeAlreadyLoggedIn;
-(void)logout;


@end
