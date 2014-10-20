//
//  JVGithubRepo.m
//  Example
//
//  Created by Ben Oberkfell on 10/19/14.
//  Copyright (c) 2014 Jive Software. All rights reserved.
//

#import "JVGithubRepo.h"

@implementation JVGithubRepo

+ (NSDictionary *)JSONKeyPathsByPropertyKey {
    return @{
             @"name" : @"name",
             @"isFork" : @"fork"
             };
}

@end
