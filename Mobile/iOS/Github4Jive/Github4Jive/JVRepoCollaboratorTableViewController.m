//
//  JVRepoCollaboratorTableViewController.m
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
 * This is a view controller that displays and removes repo collaborators.
 * There's nothing Jive-specific in this code.
 */

#import "JVRepoCollaboratorTableViewController.h"
#import "JVJiveConnectionTableViewController.h"
#import <AFNetworking/UIImageView+AFNetworking.h>

@interface JVRepoCollaboratorTableViewController ()

@property(nonatomic) JVGithubClient *githubClient;
@property(nonatomic) JVGithubRepo *repo;
@property(nonatomic) JVGithubUser *githubMeUser;
@property(nonatomic) JVJiveFactory *jiveFactory;
@property(nonatomic) JivePerson *jiveMePerson;

@property(nonatomic) NSArray* collaboratorList;

@end

@implementation JVRepoCollaboratorTableViewController

#pragma mark - UIViewController

- (id)initWithJiveFactory:(JVJiveFactory*)jiveFactory githubClient:(JVGithubClient*)githubClient jiveMePerson:(JivePerson*)jiveMePerson githubMeUser:(JVGithubUser*)githubMeUser repo:(JVGithubRepo*)repo {
    self = [super init];
    if (self) {
        self.jiveFactory = jiveFactory;
        self.githubClient = githubClient;
        self.jiveMePerson = jiveMePerson;
        self.githubMeUser = githubMeUser;
        self.repo = repo;
        
        self.collaboratorList = [NSArray new];
    }
    return self;
}

- (void)loadView {
    [super loadView];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"JVRepoCollaboratorTableViewControllerAdd", nil)
                                                                              style:UIBarButtonItemStylePlain target:self action:@selector(addUser)];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    self.navigationItem.title = self.repo.name;
    [self fetchRepoCollaborators];
}


#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    // Return the number of rows in the section.
    return [self.collaboratorList count];
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
        static NSString *reuseIdentifier = @"GithubRepoCollaboratorTableViewCell";
        
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:reuseIdentifier];
        
        if (cell == nil) {
            cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:reuseIdentifier];
        }
        
        JVGithubUser *user = [self.collaboratorList objectAtIndex:[indexPath row]];
        cell.textLabel.text = user.login;
    
    
        NSURLRequest *avatarRequest = [NSURLRequest requestWithURL:user.avatarUrl];
    
        __weak UITableViewCell *weakCell = cell;
    
        [cell.imageView setImageWithURLRequest:avatarRequest
                          placeholderImage:nil
                                   success:^(NSURLRequest *request, NSHTTPURLResponse *response, UIImage *image) {
                                       weakCell.imageView.image = image;
                                       [weakCell setNeedsLayout];
                                   } failure:nil];
    
        return cell;
}



- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    return YES;
}


- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath {
    return UITableViewCellEditingStyleDelete;
}


// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        
        JVGithubUser *userToNuke = [self.collaboratorList objectAtIndex:indexPath.row];
        [self.githubClient removeCollaborator:userToNuke toRepo:self.repo ownerName:self.githubMeUser onSuccess:^() {
            NSLog(@"Removed");
            
            NSMutableArray *replacementMutableArray = [NSMutableArray arrayWithArray:self.collaboratorList];
            [replacementMutableArray removeObjectAtIndex:indexPath.row];
            self.collaboratorList = [NSArray arrayWithArray:replacementMutableArray];
            [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationFade];
        } onError:^(NSError *error) {
            NSLog(@"Error removing user %@", error);
            [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVRepoCollaboratorTableViewControllerRemoveCollaboratorError", nil) delegate:nil cancelButtonTitle:NSLocalizedString(@"OK", nil) otherButtonTitles:nil] show];
        }];
    }
}

#pragma mark - Private API

- (void)fetchRepoCollaborators {
    
    [self.githubClient getCollaboratorsForRepo:self.repo owner:self.githubMeUser onSuccess:^(NSArray *collabList) {
        
        // Github collab response includes the owner as a collaborator
        
        NSPredicate *notMePredicate = [NSPredicate predicateWithBlock:^BOOL(JVGithubUser *item, NSDictionary *bindings) {
            return (![item.login isEqualToString:self.githubMeUser.login]);
        }];
        
        self.collaboratorList = [collabList filteredArrayUsingPredicate:notMePredicate];
        [self.tableView reloadData];
    } onError:^(NSError *error) {
        NSLog(@"Error getting repo collaborators for %@, %@", self.repo.name, [error localizedDescription]);
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", nil) message:NSLocalizedString(@"JVRepoCollaboratorTableViewControllerFetchCollaboratorError", nil) delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
        
    }];
}


- (void)addUser {
    JVJiveConnectionTableViewController *tableViewController = [[JVJiveConnectionTableViewController alloc] initWithJiveFactory:self.jiveFactory githubClient:self.githubClient jiveMePerson:self.jiveMePerson githubMeUser:self.githubMeUser repo:self.repo];
    
    [self.navigationController pushViewController:tableViewController animated:YES];
}

@end
