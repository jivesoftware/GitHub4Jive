//
//  JVJiveConnectionTableViewController.m
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
 * This is a UITableViewController that gets a list of our Jive followers.
 *
 * Check out the code in -viewDidAppear:animated: to see the call to Jive to
 * get our follower list.
 */


#import "JVJiveConnectionTableViewController.h"
#import "JVGithubCollaboratorConfirmViewController.h"
#import <AFNetworking.h>

@interface JVJiveConnectionTableViewController ()

@property(nonatomic) JVGithubClient *githubClient;
@property(nonatomic) JVGithubRepo *repo;
@property(nonatomic) JVGithubUser *githubMeUser;

@property(nonatomic) JVJiveFactory *jiveFactory;
@property(nonatomic) JivePerson *jiveMePerson;

@property (nonatomic) NSArray *jiveUsersInSet;

@end

@implementation JVJiveConnectionTableViewController

- (id)initWithJiveFactory:(JVJiveFactory*)jiveFactory githubClient:(JVGithubClient*)githubClient jiveMePerson:(JivePerson*)jiveMePerson githubMeUser:(JVGithubUser*)githubMeUser repo:(JVGithubRepo*)repo {
    self = [super init];
    if (self) {
        self.jiveFactory = jiveFactory;
        self.githubClient = githubClient;
        self.jiveMePerson = jiveMePerson;
        self.githubMeUser = githubMeUser;
        self.repo = repo;
        
        self.jiveUsersInSet = [NSArray new];
    }
    return self;
}

#pragma mark - UIViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.title = NSLocalizedString(@"JVJiveConnectionTableViewControllerMyConnections", nil);
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    // withOptions takes a JivePagedRequestOptions, if you want to get additional pages.
    
    [[self.jiveFactory jiveInstance] following:self.jiveMePerson withOptions:nil onComplete:^(NSArray *connections) {
        self.jiveUsersInSet = connections;
        [self.tableView reloadData];
    } onError:^(NSError *error) {
        NSLog(@"Error getting connections %@", error);
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVJiveConnectionTableViewControllerFetchConnectionsError", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK", nil) otherButtonTitles:nil] show];
    }];
}


#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [self.jiveUsersInSet count];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    JivePerson *person = [self.jiveUsersInSet objectAtIndex:indexPath.row];

    [self tryAddingCollaborator:person];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *reuseIdentifier = @"JiveCollaboratorTableViewCell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:reuseIdentifier];
    
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:reuseIdentifier];
    }
    
    JivePerson *person = [self.jiveUsersInSet objectAtIndex:indexPath.row];
    
    cell.textLabel.text = person.name.formatted;
    
    __weak UITableViewCell *weakCell = cell;
    
    [cell.imageView setImageWithURLRequest:[self.jiveFactory imageURLRequestForURL:person.avatarRef]
                          placeholderImage:nil
                                   success:^(NSURLRequest *request, NSHTTPURLResponse *response, UIImage *image) {
                                       weakCell.imageView.image = image;
                                       [weakCell setNeedsLayout];
                                   } failure:nil];
    
    
    return cell;
}

#pragma mark - Private API


-(void)tryAddingCollaborator:(JivePerson*)person {
    NSPredicate *workEmailPredicate = [NSPredicate predicateWithBlock:^BOOL(JiveEmail *item, NSDictionary *bindings) {
        return ([item.type isEqualToString:@"work"]);
    }];
    
    NSArray *emailList = [person.emails filteredArrayUsingPredicate:workEmailPredicate];
    JiveEmail *workEmail = [emailList objectAtIndex:0];
    if (workEmail != nil) {
        
        [self.githubClient searchUsersByEmail:workEmail.value onSuccess:^(NSArray *people) {
            if ([people count] > 0) {
                JVGithubUser *userToAdd = [people objectAtIndex:0];
                
                JVGithubCollaboratorConfirmViewController *confirmViewController = [[JVGithubCollaboratorConfirmViewController alloc] initWithJiveFactory:self.jiveFactory githubClient:self.githubClient jiveMePerson:self.jiveMePerson githubMeUser:self.githubMeUser repo:self.repo jiveCollaboratorPerson:person githubCollaboratorUser:userToAdd];
                [self.navigationController pushViewController:confirmViewController animated:YES];                
            } else {
                [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"JVJiveConnectionTableViewControllerNoUserFound", nil)  message:NSLocalizedString(@"JVJiveConnectionTableViewControllerNoUserFoundMessage", nil)  delegate:nil cancelButtonTitle:NSLocalizedString(@"OK", nil) otherButtonTitles:nil] show];
            }
        } onError:^(NSError *error) {
            NSLog(@"Error searchihg Github %@", error);
            [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVJiveConnectionTableViewControllerGithubSearchFailedMessage", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK", nil) otherButtonTitles:nil] show];
        }];
    }
    
}

@end
