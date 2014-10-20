//
//  JVLoginViewController.m
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

#import "JVLoginViewController.h"
#import "JVJiveFactory.h"
#import <Jive/Jive.h>
#import "JVGithubClient.h"
#import "GTMOAuth2ViewControllerTouch.h"
#import <Masonry.h>
#import "JVLandingViewController.h"


@interface JVLoginViewController ()

@property (nonatomic) JivePerson *me;
@property (nonatomic) JVGithubClient *githubClient;
@property (nonatomic) JVJiveFactory *jiveFactory;

@property (nonatomic) UILabel *loginHeaderLabel;
@property (nonatomic) UITextField *userName;
@property (nonatomic) UITextField *password;
@property (nonatomic) UIActivityIndicatorView *activityIndicator;

@end

@implementation JVLoginViewController

-(id)initWithJiveFactory:(JVJiveFactory*)jiveFactory {
    self = [super init];
    if (self) {
        self.edgesForExtendedLayout = UIRectEdgeNone;
        self.githubClient = [JVGithubClient new];
        self.jiveFactory = jiveFactory;
    }
    return self;
}

#pragma mark - UIViewController

- (void)loadView {
    [super loadView];
    self.title = @"Login";

    self.view.backgroundColor = [UIColor whiteColor];
    
    self.loginHeaderLabel = [UILabel new];
    self.loginHeaderLabel.text = @"Login To Jive";
    self.loginHeaderLabel.textAlignment = NSTextAlignmentCenter;
    self.loginHeaderLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:19.0f];
    
    self.userName = [UITextField new];
    self.userName.clearButtonMode = UITextFieldViewModeWhileEditing;
    self.userName.borderStyle = UITextBorderStyleRoundedRect;
    self.userName.delegate = self;
    self.userName.placeholder = @"Username";
    
    self.password = [UITextField new];
    self.password.clearButtonMode = UITextFieldViewModeWhileEditing;
    self.password.borderStyle = UITextBorderStyleRoundedRect;
    self.password.delegate = self;
    self.password.placeholder = @"Password";

    self.activityIndicator = [UIActivityIndicatorView new];
    self.activityIndicator.activityIndicatorViewStyle = UIActivityIndicatorViewStyleGray;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [self.view addSubview:self.loginHeaderLabel];
    [self.loginHeaderLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.view).with.offset(10);
        make.left.equalTo(self.view).with.offset(20);
        make.right.equalTo(self.view).with.offset(-20);
    }];

    [self.view addSubview:self.userName];
    [self.userName mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.loginHeaderLabel.mas_bottom).with.offset(10);
        make.left.equalTo(self.view).with.offset(20);
        make.right.equalTo(self.view).with.offset(-20);
    }];
    
    [self.view addSubview:self.password];
    [self.password mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.userName.mas_bottom).with.offset(10);
        make.left.equalTo(self.userName);
        make.right.equalTo(self.userName);
    }];
}

- (void)viewDidAppear:(BOOL)animated {
    self.password.text = nil;
    [self.userName becomeFirstResponder];
    [super viewDidAppear:animated];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    [segue.destinationViewController setMe:self.me];
    [segue.destinationViewController setGithubClient:self.githubClient];
    [segue.destinationViewController setJiveFactory:self.jiveFactory];
}

#pragma mark - UITextFieldDelegate

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    if (textField == self.userName) {
        [self.password becomeFirstResponder];
    } else if (self.userName.text.length == 0) {
        [self.userName becomeFirstResponder];
    } else if (self.password.text.length > 0) {
        [self.activityIndicator startAnimating];
        [self.password resignFirstResponder];
        self.userName.enabled = NO;
        self.password.enabled = NO;
        [self.jiveFactory loginWithName:self.userName.text
                            password:self.password.text
                            complete:^(JivePerson *person) {
                                [self handleLogin:person];
                            } error:^(NSError *error) {
                                [self resetLoginView];
                                [self.password becomeFirstResponder];
                            }];
    }
    
    return NO;
}

#pragma mark - Private API

- (void)handleLogin:(JivePerson *)person {
    self.me = person;
    [self resetLoginView];
    
    GTMOAuth2ViewControllerTouch *oauthViewController = [self.githubClient oauthViewControllerWithSuccess:^{
        [self.navigationController dismissViewControllerAnimated:NO completion:nil];
        [self proceedAfterLogin];
    } onError:^(NSError *error) {
        [self.navigationController dismissViewControllerAnimated:NO completion:nil];
        [[[UIAlertView alloc] initWithTitle:@"Error" message:@"An error occurred signing into Github." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
    }];
    [[self navigationController] pushViewController:oauthViewController animated:YES];
    
}

- (void)proceedAfterLogin {
    JVLandingViewController *landingViewController = [[JVLandingViewController alloc] initWithJiveFactory:self.jiveFactory githubClient:self.githubClient jiveMePerson:self.me];
    [self.navigationController setViewControllers:@[landingViewController]];
}

- (void)resetLoginView {
    [self.activityIndicator stopAnimating];
    self.userName.enabled = YES;
    self.password.enabled = YES;
    self.password.text = nil;
}



@end
