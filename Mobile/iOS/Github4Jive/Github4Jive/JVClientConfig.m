//
//  JVClientConfig.m
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


#import "JVClientConfig.h"

@interface JVClientConfig ()

@property(nonatomic) NSDictionary *dictionary;

@end

@implementation JVClientConfig

static NSString* const JVClientConfigJiveOAuthConsumerKeyKey = @"jive_oauth_consumer_key";
static NSString* const JVClientConfigJiveOAuthConsumerSecretKey = @"jive_oauth_consumer_secret";

static NSString* const JVClientConfigGithubOAuthConsumerKeyKey = @"github_oauth_consumer_key";
static NSString* const JVClientConfigGithubOAuthConsumerSecretKey = @"github_oauth_consumer_secret";

- (id)init {
    self = [super init];
    
    if (self) {
        NSString *clientConfigPlistPath = [[NSBundle mainBundle] pathForResource:@"client_config"
                                                                            ofType:@"plist"];
        if (clientConfigPlistPath) {
            self.dictionary = [NSDictionary dictionaryWithContentsOfFile:clientConfigPlistPath];
        } else {
            self.dictionary = [NSDictionary new];
        }
    }
    return self;
}

-(NSString*)jiveOAuthConsumerKey {
    return [self.dictionary objectForKey:JVClientConfigJiveOAuthConsumerKeyKey];
}

-(NSString*)jiveOAuthConsumerSecret {
    return [self.dictionary objectForKey:JVClientConfigJiveOAuthConsumerSecretKey];
}

-(NSString*)githubOAuthConsumerKey {
    return [self.dictionary objectForKey:JVClientConfigGithubOAuthConsumerKeyKey];
}

-(NSString*)githubOAuthConsumerSecret {
    return [self.dictionary objectForKey:JVClientConfigGithubOAuthConsumerSecretKey];
}




@end
