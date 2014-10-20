//
//  JVAppDelegate.m
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

#import "JVAppDelegate.h"
#import "JVCommunityViewController.h"

@interface JVAppDelegate ()

@property (nonatomic) UIViewController *viewController;

@end

@implementation JVAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[UIWindow alloc] initWithFrame:
                   [[UIScreen mainScreen] bounds]];
    self.viewController = [UINavigationController new];
    self.window.backgroundColor = [UIColor whiteColor];
    [(UINavigationController*) self.viewController pushViewController:[JVCommunityViewController new] animated:NO];
    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    return YES;
}


@end
