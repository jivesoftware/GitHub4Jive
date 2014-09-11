GitHub for Jive - Developer Notes
=================================

The Strategies directory contains classes and implementations that encapsulate the GitHub event handling,
and related setup and teardown at runtime. 

EventStrategyBase abstract class 
--------------------------------

Strategies themselves encapsulate the business logic that occurs on the event by calling the GitHubFacade
subscribeToRepoEvent function and passing a handler function that will be called on the event. This should
be called by overriding the EventStrategyBase's setup function to handle custom setupOptions.

The EventStrategyBase teardown function handles un-registration from the event. In most cases it does not 
need to be overridden. If it must be for extra functionality then it should call the unsubscribeFromRepoEvent
function of the GitHubFacade using the teardownOptions.eventToken.

StrategySetBuilderBase abstract class 
-------------------------------------

Because many different kinds of objects can logically "register" to a GitHubEvent (currently places and tiles)
each object gets its own set of strategies that get setup and torndown when they are created/updated or deleted
at runtime. In addition because different types of objects need different handlers each family of objects needs 
to derive their own strategies and strategy set builders to encapsulate necessary strategies. 

Ex: the Place service and Recent Issues Tile implement their own strategy for the GitHub event "issues" and
the place service also has a strategy for "issue_comment".
Because they have different strategies they also have their own strategy set builder that exposes a fluent
api to add strategies at runtime. Build should NEVER be overridden. The Place service's builder exposes issues()
and issueComments() for both of its possible strategies.

This way the client code can call something that looks like this

    var set = builder.issues().issueComments().build();
 
 or something more dynamic like
 
     builder.issues();
 
     if(instanceNeedsCommentEvents(obj)){
        builder.issueComments();
     }
 
     var set = builder.build();
 
EventStrategySkeleton Class 
----------------------------
 
 Finally, to complete the encapsulation of creating/updating or removing objects attached to these sets is the
 EventStrategySkeleton. This "class" takes 3 functions that customizes the overall strategy. Those functions
 are:
 

1.  instancePredicate: 

        function(lhs, rhs){
            return true when lhs and rhs represent the same instance;
        }

2. setupOptionsProvider: 
    
        function(){
            return options needed for all relevant strategies setup functions;
        }

3. teardownOptionsProvider: 

        functon(){
            return options needed for all relevant strategies teardown function;
        }

Then client code would call the skeletons addOrUpdate(instance, strategySetBuilder) function for each 
object when it is created or updated. In the case of update the teardown function of each strategy is called
and then in the same order each strategy setup functon is called.

When one of the objects no longer needs to handle events than call skeleton.remove(instance);

EventTokenPool class
--------------------

The EventTokenPool is a pure service for the builder. It is a simple wrapper on a hash to handle the
GitHubFacade handler tokens by some key. 
