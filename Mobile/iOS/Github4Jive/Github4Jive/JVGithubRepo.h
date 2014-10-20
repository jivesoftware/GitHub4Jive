//
//  JVGithubRepo.h
//  Example
//
//  Created by Ben Oberkfell on 10/19/14.
//  Copyright (c) 2014 Jive Software. All rights reserved.
//

#import <Mantle.h>

@interface JVGithubRepo : MTLModel<MTLJSONSerializing>

@property(nonatomic, copy, readonly) NSString *name;
@property(nonatomic, readonly) BOOL isFork;

@end
