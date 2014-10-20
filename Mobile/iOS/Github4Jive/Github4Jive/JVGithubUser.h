//
//  JVGithubUser.h
//  Example
//
//  Created by Ben Oberkfell on 10/19/14.
//  Copyright (c) 2014 Jive Software. All rights reserved.
//

#import "MTLModel.h"
#import <Mantle.h>

@interface JVGithubUser : MTLModel <MTLJSONSerializing>

/* There is a whole set of other fields on the Github User response that 
 * this does not capture, but we don't need them for the sake of this demo. */

@property (nonatomic, copy, readonly) NSString *login;
@property (nonatomic, copy, readonly) NSURL *avatarUrl;
@property (nonatomic, copy, readonly) NSString *name;
@property (nonatomic, copy, readonly) NSString *email;

@end
