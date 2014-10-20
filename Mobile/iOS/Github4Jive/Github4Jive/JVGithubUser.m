//
//  JVGithubUser.m
//  Example
//
//  Created by Ben Oberkfell on 10/19/14.
//  Copyright (c) 2014 Jive Software. All rights reserved.
//

#import "JVGithubUser.h"

@implementation JVGithubUser

+ (NSDictionary *)JSONKeyPathsByPropertyKey {
    return @{
             @"login": @"login",
             @"avatarUrl": @"avatar_url",
             @"name" : @"name",
             @"email" : @"email"
             };
}

+ (NSValueTransformer *)avatarUrlJSONTransformer {
    return [NSValueTransformer valueTransformerForName:MTLURLValueTransformerName];
}


@end
