//
//  JVLandingViewController.m
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

/* WHAT'S INSIDE:
 * This is a view controller that displays a mashup of Jive user info,
 * as well as Github user info.
 *
 * Pay especially close attention to fetching avatars for Jive users.
 * The URL request must be authenticated.
 *
 * Check out -displayJiveInfo for implementation details.
 */


#import "JVLandingViewController.h"
#import "JVRepoCollaboratorTableViewController.h"
#import <UIImageView+AFNetworking.h>
#import <Masonry.h>
#import "JVCommunityViewController.h"

@interface JVLandingViewController () <UITableViewDataSource,UITableViewDelegate>

@property(nonatomic) JVJiveFactory *jiveFactory;
@property(nonatomic) JivePerson *jiveMePerson;
@property(nonatomic) JVGithubClient *githubClient;
@property(nonatomic) JVGithubUser *githubMeUser;

@property (nonatomic) UIImageView *githubAvatarImageView;
@property (nonatomic) UILabel *githubUsernameLabel;
@property (nonatomic) UIImageView *jiveAvatarImageView;
@property (nonatomic) UILabel *jiveFullNameLabel;
@property (nonatomic) UITableView *repoTableView;
@property (nonatomic) UILabel *repoTitleLabel;
@property (nonatomic) UILabel *repoSubtitleLabel;

@property (nonatomic) NSArray* reposList;


@end

@implementation JVLandingViewController

- (id)initWithJiveFactory:(JVJiveFactory*)jiveFactory githubClient:(JVGithubClient*)githubClient jiveMePerson:(JivePerson*)jiveMePerson {
    self = [super init];
    if (self) {
        self.edgesForExtendedLayout = UIRectEdgeNone;
        
        self.reposList = [NSArray new];

        self.jiveFactory = jiveFactory;
        self.jiveMePerson = jiveMePerson;
        self.githubClient = githubClient;
    }
    return self;
}

#pragma mark - UIViewController

- (void)loadView {
    [super loadView];
    
    self.title = NSLocalizedString(@"JVLandingControllerTitle", nil);
    self.jiveAvatarImageView = [UIImageView new];
    self.githubAvatarImageView = [UIImageView new];
    self.repoTableView = [UITableView new];
    
    self.jiveFullNameLabel = [UILabel new];
    self.jiveFullNameLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:36.0f];
    self.jiveFullNameLabel.numberOfLines = 0;
    self.jiveFullNameLabel.textAlignment = NSTextAlignmentCenter;

    self.githubUsernameLabel = [UILabel new];
    self.githubUsernameLabel.font = [UIFont fontWithName:@"HelveticaNeue" size:16.0f];
    self.githubUsernameLabel.textColor = [UIColor blueColor];
    
    self.repoTitleLabel = [UILabel new];
    self.repoTitleLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:20.0f];
    self.repoTitleLabel.text = NSLocalizedString(@"JVLandingControllerRepoTitleText", nil);

    self.repoSubtitleLabel = [UILabel new];
    self.repoSubtitleLabel.font = [UIFont fontWithName:@"HelveticaNeue-Thin" size:14.0f];
    self.repoSubtitleLabel.text = NSLocalizedString(@"JVLandingControllerRepoSubTitleText", nil);
    
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"JVLandingControllerLogout", nil)
                                                                              style:UIBarButtonItemStylePlain target:self action:@selector(logout)];


}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.repoTableView.dataSource = self;
    self.repoTableView.delegate = self;

    [self.view addSubview:self.jiveAvatarImageView];
    [self.jiveAvatarImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.view).offset(10);
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

    [self.view addSubview:self.jiveFullNameLabel];
    [self.jiveFullNameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.jiveAvatarImageView.mas_bottom).offset(10);
        make.left.equalTo(self.view.mas_left).offset(20);
        make.right.equalTo(self.view.mas_right).offset(-20);
        make.centerX.equalTo(self.view.mas_centerX);
    }];
    
    [self.view addSubview:self.githubUsernameLabel];
    [self.githubUsernameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.jiveFullNameLabel.mas_bottom).offset(5);
        make.centerX.equalTo(self.view.mas_centerX);
    }];

    [self.view addSubview:self.repoTitleLabel];
    [self.repoTitleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.githubUsernameLabel.mas_bottom).offset(10);
        make.centerX.equalTo(self.view.mas_centerX);
    }];
    
    [self.view addSubview:self.repoSubtitleLabel];
    [self.repoSubtitleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.repoTitleLabel.mas_bottom).offset(5);
        make.centerX.equalTo(self.view.mas_centerX);
    }];

    
    [self.view addSubview:self.repoTableView];
    [self.repoTableView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.repoSubtitleLabel.mas_bottom).offset(10);
        make.bottom.equalTo(self.view);
        make.left.equalTo(self.view);
        make.right.equalTo(self.view);
    }];
}

- (void) viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [self fetchAndDisplayGithubInfo];
    [self displayJiveInfo];
    [self fetchAndDisplayMyGithubRepos];
}


# pragma mark - User Info

-(void)displayJiveInfo {
    [[self.jiveFactory jiveInstance] avatarForPerson:self.jiveMePerson onComplete:^(UIImage *avatarImage) {
        self.jiveAvatarImageView.image = avatarImage;
    } onError:^(NSError *error) {
        NSLog(@"Oops, an error occurred getting my avatar");
    }];
    self.jiveFullNameLabel.text = [self.jiveMePerson displayName];
}

-(void)fetchAndDisplayGithubInfo {
    [self.githubClient getMyUserInfo:^(JVGithubUser *user) {
        [self.githubAvatarImageView setImageWithURL:user.avatarUrl];
        self.githubMeUser = user;
        NSString *githubFriendlyName = [NSString stringWithFormat:@"@%@", user.login];
        self.githubUsernameLabel.text = githubFriendlyName;
    } onError:^(NSError *error) {
        NSLog(@"Error getting Github info %@", error);
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVLandingControllerGithubInfoError", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK",nil) otherButtonTitles:nil] show];
    }];
}

-(void)fetchAndDisplayMyGithubRepos {
    [self.githubClient getMyRepos:^(NSArray *reposList) {
        self.reposList = reposList;
    } onError:^(NSError *error) {
        NSLog(@"Oops, an error occurred getting my repo list. %@", error);
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVLandingControllerGithubRepoError", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK",nil) otherButtonTitles:nil] show];
    }];
}

#pragma mark - UITableViewDataSource

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *cellId = @"GithubRepoTableViewCell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellId];
    
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellId];
    }
    
    JVGithubRepo *repo = [self.reposList objectAtIndex:[indexPath row]];
    cell.textLabel.text = repo.name;
    return cell;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [self.reposList count];
}

#pragma mark - UITableViewDelegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    if (self.githubMeUser != nil) {
        JVGithubRepo *selectedRepoInfo = [self.reposList objectAtIndex:[indexPath row]];
        JVRepoCollaboratorTableViewController *repoTableViewController = [[JVRepoCollaboratorTableViewController alloc] initWithJiveFactory:self.jiveFactory githubClient:self.githubClient jiveMePerson:self.jiveMePerson githubMeUser:self.githubMeUser repo:selectedRepoInfo];
        [self.navigationController pushViewController:repoTableViewController animated:YES];
    }
}

#pragma mark - Private API

-(void)setReposList:(NSArray *)reposList {
    if (_reposList != reposList) {
        _reposList = reposList;
        [self.repoTableView reloadData];
    }
}

-(void)logout {
    
    JVCommunityViewController *communityViewController = [JVCommunityViewController new];
    [self.githubClient logout];
    [self.jiveFactory logout:^{
        NSLog(@"Logged out");
    } error:^(NSError *error) {
        NSLog(@"Error logging out, bailing out anyway. %@", error);
    }];
    [self.navigationController setViewControllers:@[communityViewController]];

}

@end
