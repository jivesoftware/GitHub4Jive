//
//  JVCommunityViewController.m
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


#import "JVCommunityViewController.h"
#import "JVJiveFactory.h"
#import "JVLoginViewController.h"
#import "JVLandingViewController.h"
#import "JVGithubClient.h"
#import <Masonry.h>

@interface JVCommunityViewController ()

@property (nonatomic)JVJiveFactory *jiveFactory;


@property (nonatomic) UITextField *communityURL;
@property (nonatomic) UIActivityIndicatorView *activityIndicator;
@property (nonatomic) UILabel *communityEntryLabel;

@end

@implementation JVCommunityViewController

- (id)init {
    self = [super init];
    if (self) {
        self.edgesForExtendedLayout = UIRectEdgeNone;
    }
    return self;
}

#pragma mark - UIViewController

- (void)loadView {
    [super loadView];
    
    self.title = @"Community";
    
    self.communityURL = [UITextField new];
    self.communityURL.clearButtonMode = UITextFieldViewModeWhileEditing;
    self.communityURL.borderStyle = UITextBorderStyleRoundedRect;
    self.communityURL.text = @"http://192.168.2.150:8080";
    self.communityURL.delegate = self;
    
    self.communityEntryLabel = [[UILabel alloc] init];
    self.communityEntryLabel.numberOfLines = 0;
    self.communityEntryLabel.textAlignment = NSTextAlignmentCenter;
    self.communityEntryLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:19.0f];
    self.communityEntryLabel.text = @"Please Enter the URL for Your Jive Community";
    
    self.activityIndicator = [UIActivityIndicatorView new];
    self.activityIndicator.activityIndicatorViewStyle = UIActivityIndicatorViewStyleGray;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.view addSubview:self.communityEntryLabel];

    [self.communityEntryLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.view.mas_top).with.offset(20);
        make.left.equalTo(self.view.mas_left).with.offset(20);
        make.right.equalTo(self.view.mas_right).with.offset(-20);
    }];
    
    [self.view addSubview:self.communityURL];
    [self.communityURL mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.communityEntryLabel.mas_bottom).with.offset(10);
        make.left.equalTo(self.view.mas_left).with.offset(10);
        make.right.equalTo(self.view.mas_right).with.offset(-10);
    }];
    
    [self.view addSubview:self.activityIndicator];
    [self.activityIndicator mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.communityURL.mas_bottom).with.offset(10);
        make.centerX.equalTo(self.view);
    }];
}

- (void)viewDidAppear:(BOOL)animated {
    self.communityURL.enabled = YES;
    [self.communityURL becomeFirstResponder];
    [super viewDidAppear:animated];
}



#pragma mark - UITextFieldDelegate

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    // Assume the default instance.
    NSString *instanceString = @"https://community.jivesoftware.com/";
    
    // Check to see if the user entered a different url.
    if (self.communityURL.text.length > 0) {
        instanceString = self.communityURL.text;
        if (![instanceString hasPrefix:@"http"]) {
            instanceString = [@"http://" stringByAppendingString:instanceString];
            // But what if it should be https:// ?
        }
        
        // The SDK assumes the URL has a / at the end. So make sure it does.
        if (![instanceString hasSuffix:@"/"]) {
            instanceString = [instanceString stringByAppendingString:@"/"];
        }
    }
    
    NSURL *instanceURL = [NSURL URLWithString:instanceString];
    __block JVJiveFactory *factory = nil;
    
    [self.activityIndicator startAnimating];
    [self.communityURL resignFirstResponder];
    self.communityURL.enabled = NO;
    // Is it a valid instance?
    factory = [[JVJiveFactory alloc] initWithInstanceURL:instanceURL
                                                complete:^(JivePlatformVersion *version) {
                                                    [self checkForRedirect:version
                                                                   fromURL:instanceURL
                                                                   factory:factory];
                                                } error:^(NSError *error) {
                                                    [self.activityIndicator stopAnimating];
                                                    self.communityURL.enabled = YES;
                                                    [self.communityURL becomeFirstResponder];
                                                }];
    
    return NO;
}

#pragma mark - Private API

- (void)advanceToLogin:(JVJiveFactory *)factory {
    [self.activityIndicator stopAnimating];
    self.jiveFactory = factory;
    
    JVGithubClient *githubClient = [JVGithubClient new];
    
    //If we think we already have credentials, try them and bypass login.
    if ([self.jiveFactory hasCredentialsForCommunity] && [githubClient maybeAlreadyLoggedIn]) {
        [self.jiveFactory getMe:^(JivePerson *person) {
            JVLandingViewController *landing = [JVLandingViewController new];
            landing.githubClient = githubClient;
            landing.jiveFactory = self.jiveFactory;
            landing.jiveMePerson = person;
            [self.navigationController setViewControllers:@[landing]];
        } error:^(NSError *error) {
            // Our credentials must not be good.
            [self goToLoginPage];
        }];
    } else {
        [self goToLoginPage];
    }
}

- (void)goToLoginPage {
    JVLoginViewController *loginViewController = [[JVLoginViewController alloc] initWithJiveFactory:self.jiveFactory];
    [self.navigationController pushViewController:loginViewController animated:YES];
}

- (void)checkForRedirect:(JivePlatformVersion *)version
                 fromURL:(NSURL *)targetURL
                 factory:(JVJiveFactory *)initialFactory {
    // Not all instances report their url in the version.
    if (!version.instanceURL || [version.instanceURL isEqual:targetURL]) {
        [self advanceToLogin:initialFactory];
    } else {
        // Attempt to redirect to the server's instance url.
        __block JVJiveFactory *factory = nil;
        
        factory = [[JVJiveFactory alloc] initWithInstanceURL:version.instanceURL
                                                    complete:^(JivePlatformVersion *redirectVersion) {
                                                        // Direct access granted.
                                                        self.communityURL.text = redirectVersion.instanceURL.absoluteString;
                                                        [self advanceToLogin:factory];
                                                    }
                                                       error:^(NSError *error) {
                                                           // The server lied, bad server. Use the original url.
                                                           [self advanceToLogin:initialFactory];
                                                       }];
    }
}



@end
