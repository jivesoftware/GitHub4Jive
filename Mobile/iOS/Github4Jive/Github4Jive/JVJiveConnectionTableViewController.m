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


#import "JVJiveConnectionTableViewController.h"
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
    
    self.title = @"My Followers";
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    [[self.jiveFactory jiveInstance] followers:self.jiveMePerson onComplete:^(NSArray *followers) {
        self.jiveUsersInSet = followers;
        [self.tableView reloadData];
    } onError:^(NSError *error) {
        NSLog(@"Error getting followers %@", error);
        [[[UIAlertView alloc] initWithTitle:@"Error" message:@"An error occurred getting your followers." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];

        
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
        
        __typeof(self) __weak weakSelf = self;
        [self.githubClient searchUsersByEmail:workEmail.value onSuccess:^(NSArray *people) {
            if ([people count] > 0) {
                JVGithubUser *userToAdd = [people objectAtIndex:0];
                [self.githubClient addCollaborator:userToAdd toRepo:self.repo ownerName:self.githubMeUser onSuccess:^{
                    __typeof(self) __strong strongWeakSelf = weakSelf;
                    [strongWeakSelf.navigationController popViewControllerAnimated:YES];
                } onError:^(NSError *error) {
                    NSLog(@"Error adding user %@", error);
                    [[[UIAlertView alloc] initWithTitle:@"Error" message:@"An error adding this collaborator." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];

                }];
            } else {
                [[[UIAlertView alloc] initWithTitle:@"No User Found" message:@"We couldn't find a Github user with this person's work email." delegate:nil cancelButtonTitle:@"Oh well." otherButtonTitles:nil] show];
            }
        } onError:^(NSError *error) {
            NSLog(@"Error searchihg Github %@", error);
            [[[UIAlertView alloc] initWithTitle:@"Error" message:@"An error occurred while trying to see if this follower is on Github." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
        }];
    }
}

@end
