//
//  JVGithubCollaboratorConfirmViewController.m
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

#import <Masonry.h>
#import <AFNetworking.h>

#import "JVGithubCollaboratorConfirmViewController.h"

@interface JVGithubCollaboratorConfirmViewController ()

@property(nonatomic) JVGithubClient *githubClient;
@property(nonatomic) JVGithubRepo *repo;
@property(nonatomic) JVGithubUser *githubCollaboratorUser;
@property(nonatomic) JVGithubUser *githubMeUser;

@property(nonatomic) JVJiveFactory *jiveFactory;
@property(nonatomic) JivePerson *jiveMePerson;
@property(nonatomic) JivePerson *jiveCollaboratorPerson;

@property (nonatomic) UIImageView *githubAvatarImageView;
@property (nonatomic) UILabel *githubUsernameLabel;
@property (nonatomic) UIImageView *jiveAvatarImageView;
@property (nonatomic) UILabel *jiveFullNameLabel;

@property (nonatomic) UILabel *addCollaboratorExplanationLabel;
@property (nonatomic) UIButton *addCollaboratorButton;

@end

@implementation JVGithubCollaboratorConfirmViewController

- (id)initWithJiveFactory:(JVJiveFactory*)jiveFactory githubClient:(JVGithubClient*)githubClient jiveMePerson:(JivePerson*)jiveMePerson githubMeUser:(JVGithubUser*)githubMeUser repo:(JVGithubRepo*)repo jiveCollaboratorPerson:(JivePerson*)jiveCollaboratorPerson githubCollaboratorUser:(JVGithubUser*)githubCollaboratorUser{
    
    self = [super init];
    if (self) {
        self.jiveFactory = jiveFactory;
        self.githubClient = githubClient;
        self.jiveMePerson = jiveMePerson;
        self.githubMeUser = githubMeUser;
        self.repo = repo;
        self.jiveCollaboratorPerson = jiveCollaboratorPerson;
        self.githubCollaboratorUser = githubCollaboratorUser;
        
        self.edgesForExtendedLayout = UIRectEdgeNone;
    }
    return self;
}

- (void)loadView {
    [super loadView];
 
    self.view.backgroundColor = [UIColor whiteColor];
    self.title = self.jiveCollaboratorPerson.name.givenName;
    self.jiveAvatarImageView = [UIImageView new];
    self.githubAvatarImageView = [UIImageView new];
    
    self.jiveFullNameLabel = [UILabel new];
    self.jiveFullNameLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:36.0f];
    self.jiveFullNameLabel.numberOfLines = 0;
    self.jiveFullNameLabel.textAlignment = NSTextAlignmentCenter;
    
    self.githubUsernameLabel = [UILabel new];
    self.githubUsernameLabel.font = [UIFont fontWithName:@"HelveticaNeue" size:16.0f];
    self.githubUsernameLabel.textColor = [UIColor blueColor];
    
    self.addCollaboratorButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    self.addCollaboratorButton.titleLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:20.0f];
    [self.addCollaboratorButton addTarget:self action:@selector(addAsCollaborator) forControlEvents:UIControlEventTouchUpInside];
    [self.addCollaboratorButton setTitle:NSLocalizedString(@"JVGithubCollaboratorConfirmViewControllerAddAsCollaborator", nil) forState:UIControlStateNormal];
    
    self.addCollaboratorExplanationLabel = [UILabel new];
    self.addCollaboratorExplanationLabel.numberOfLines = 0;
    self.addCollaboratorExplanationLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:16.0f];
    self.addCollaboratorExplanationLabel.text = [NSString stringWithFormat:NSLocalizedString(@"JVGithubCollaboratorConfirmViewControllerAddAsCollaboratorExplanationFormat", nil), self.repo.name];

}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Put the add button in the middle and work our way up from there
    
    [self.view addSubview:self.addCollaboratorButton];
    [self.addCollaboratorButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self.view.mas_centerX);
        make.centerY.equalTo(self.view.mas_centerY);
    }];
    
    [self.view addSubview:self.addCollaboratorExplanationLabel];
    [self.addCollaboratorExplanationLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.addCollaboratorButton.mas_bottom).offset(5);
        make.left.equalTo(self.view.mas_left).offset(20);
        make.right.equalTo(self.view.mas_right).offset(-20);
        make.centerX.equalTo(self.view.mas_centerX);
    }];
    
    [self.view addSubview:self.githubUsernameLabel];
    [self.githubUsernameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.bottom.equalTo(self.addCollaboratorButton.mas_top).offset(-20);
        make.centerX.equalTo(self.view.mas_centerX);
    }];
    
    [self.view addSubview:self.jiveFullNameLabel];
    [self.jiveFullNameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.bottom.equalTo(self.githubUsernameLabel.mas_top).offset(-10);
        make.left.equalTo(self.view.mas_left).offset(20);
        make.right.equalTo(self.view.mas_right).offset(-20);
        make.centerX.equalTo(self.view.mas_centerX);
    }];
    
    [self.view addSubview:self.jiveAvatarImageView];
    [self.jiveAvatarImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.bottom.equalTo(self.jiveFullNameLabel.mas_top).offset(-10);
        make.height.equalTo(@80);
        make.width.equalTo(@80);
        make.left.mas_equalTo(self.view).offset(50);
    }];
    self.jiveAvatarImageView.layer.cornerRadius = 40;
    self.jiveAvatarImageView.clipsToBounds = YES;
    
    [self.view addSubview:self.githubAvatarImageView];
    [self.githubAvatarImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.jiveAvatarImageView);
        make.height.equalTo(@80);
        make.width.equalTo(@80);
        make.right.mas_equalTo(self.view).offset(-50);
    }];
    self.githubAvatarImageView.layer.cornerRadius = 40;
    self.githubAvatarImageView.clipsToBounds = YES;
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [self displayJiveInfo];
    [self displayGithubInfo];
}

#pragma mark - Private API

-(void)displayJiveInfo {
    [[self.jiveFactory jiveInstance] avatarForPerson:self.jiveCollaboratorPerson onComplete:^(UIImage *avatarImage) {
        self.jiveAvatarImageView.image = avatarImage;
    } onError:^(NSError *error) {
        NSLog(@"Oops, an error occurred getting my avatar");
    }];
    self.jiveFullNameLabel.text = [self.jiveCollaboratorPerson displayName];
}

-(void)displayGithubInfo {
    [self.githubAvatarImageView setImageWithURL:self.githubCollaboratorUser.avatarUrl];
    NSString *githubFriendlyName = [NSString stringWithFormat:@"@%@", self.githubCollaboratorUser.login];
    self.githubUsernameLabel.text = githubFriendlyName;
}

-(void)addAsCollaborator {
    __typeof(self) __weak weakSelf = self;
    [self.githubClient addCollaborator:self.githubCollaboratorUser toRepo:self.repo ownerName:self.githubMeUser onSuccess:^{
        __typeof(self) __strong strongWeakSelf = weakSelf;
        [strongWeakSelf.navigationController popToViewController:[strongWeakSelf.navigationController.viewControllers objectAtIndex:1] animated:YES];
    } onError:^(NSError *error) {
        NSLog(@"Error adding user %@", error);
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVGithubCollaboratorConfirmViewControllerAddCollaboratorError", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK", nil) otherButtonTitles:nil] show];
    }];
}


@end
