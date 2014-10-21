//
//  JVOAuthRefresher.m
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

#import "JVOAuthRefresher.h"
#import <NSError+Jive.h>

@interface JVOAuthRefresher ()

@property(nonatomic) JVJiveFactory *jiveFactory;

//
@property(nonatomic) NSMutableArray *retryBlocks;
@property(nonatomic) NSMutableArray *failBlocks;

@end

@implementation JVOAuthRefresher

-(id)initWithJiveFactory:(JVJiveFactory *)jiveFactory {
    self = [super init];
    if (self) {
        self.jiveFactory = jiveFactory;
        self.retryBlocks = [NSMutableArray array];
        self.failBlocks = [NSMutableArray array];
    }
    
    return self;
}

// This gets called if an operation fails and maybe should be retried.

- (void)retryingOperation:(NSOperation *)retryingOperation
     retryFailedOperation:(NSOperation *)failedOperation
      thatFailedWithError:(NSError *)originalError
           withRetryBlock:(JiveOperationRetrierRetryBlock)retryBlock
                failBlock:(JiveOperationRetrierFailBlock)failBlock {
    BOOL isHTTPRequestOperation = [retryingOperation isKindOfClass:[AFHTTPRequestOperation class]];
    
    if (isHTTPRequestOperation) {
        AFHTTPRequestOperation *retryingHTTPRequestOperation = (AFHTTPRequestOperation *)retryingOperation;
        [self tryReauthenticatingHTTPRequestOperation:retryingHTTPRequestOperation
                                         thatFailedWithError:originalError
                                              withRetryBlock:retryBlock
                                                   failBlock:failBlock];
    } else {
        NSLog(@"Error: Don't know how to retry an operation %@", [retryingOperation class]);
        failBlock(originalError);
    }
}

// Take a stab at refreshing OAuth, if we can.

- (void)tryReauthenticatingHTTPRequestOperation:(AFHTTPRequestOperation *)retryingHTTPRequestOperation
                                   thatFailedWithError:(NSError *)originalError
                                        withRetryBlock:(JiveOperationRetrierRetryBlock)retryBlock
                                             failBlock:(JiveOperationRetrierFailBlock)failBlock {
    dispatch_block_t failWithOriginalErrorBlock = ^{
        failBlock(originalError);
    };
    [self.retryBlocks addObject:retryBlock];
    [self.failBlocks addObject:failWithOriginalErrorBlock];
    
    NSHTTPURLResponse *HTTPURLResponse = [originalError userInfo][AFNetworkingOperationFailingURLResponseErrorKey];
    NSInteger statusCode = [HTTPURLResponse statusCode];
    
    if (statusCode == 401) {
        [self.jiveFactory attemptOAuthRefreshWithCompleteBlock:^{
            for (dispatch_block_t successBlock in self.retryBlocks) {
                successBlock();
            }
            [self clearBlocks];
        } onError:^(NSError *error) {
            for (dispatch_block_t failureBlock in self.failBlocks) {
                failureBlock();
            }
            [self clearBlocks];
        }];
    }
}

// Make a clone of the operation that failed, using the original request.

-(NSOperation<JiveRetryingOperation>*)retriableOperationForFailedOperation:(NSOperation<JiveRetryingOperation>*)failedOperation {
    AFURLConnectionOperation<JiveRetryingOperation> *newOperation;
    NSMutableURLRequest *newRequest = [[(AFHTTPRequestOperation*)failedOperation request] mutableCopy];
    [self.jiveFactory applyCredentialsToRequest:newRequest];
        
    Class operationClass = [failedOperation class];
        
    newOperation = [[operationClass alloc ] initWithRequest:newRequest];
    
    return newOperation;
}

-(void)clearBlocks {
    [self.retryBlocks removeAllObjects];
    [self.failBlocks removeAllObjects];
}

@end
