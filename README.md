# GitHub4Jive

This project demonstrates the power of integrating with the Jive Platform. By combining all
of the major collaborative elements of GitHub into one add-on, Jive can drive innovation
with rich discussions and quick access to GitHub resources, all from within Jive. Tiles, apps,
services, web hooks, and cartridges are used to make this experience both natural and
powerful.

*Note: For architecture details and development notes for each component, please see the corresponding **developer_notes.md** in the component directory.*

# User Stories - General
As a **user**, I should be able to:
* see what places are linked to GitHub. 
* These should link to the place's page
* Show stats for the connected repository on commits, issues, pull requests.

As a **contributor**, I should be able to:
* see a list of the places that I have contributed GitHub content to
* Each of these should show my activity in the form of statistics about commits, issues, and pull requests
* see a list of my recent commits regardless of place
* see a list of recent issues I have created or commented on

As a **person** with the keys to the repository, I should be able to:
* hide a repository linked place from the public list (not sure if this can already be done with security groups).
* create a new place or link an existing one to a repository on GitHub. 
* Desynchronize with GitHub (turn off webhooks).

# User Stories - Issues
As a **contributor**, I should be able to:
* create an issue in Jive and all comments in Jive should be sent to GitHub.
* comment on an issue in GitHub and comments should be picked up in the Jive Issue discussion.
* change the state of an issue in Jive.
* see the most recent open issues related to a place.
* see issue state changes and comments in the activity feed.

# User Stories - Commits
As any **user**, I should be able to:
* see recent commits and changes that have occurred on the repository.
* Those commits should also allow me to see the diff to allow me to see what code changed.

As a **contributor**, I should be able to:
* reference any commit in the repository in a document or discussion.
* link to github.
* show at least the files changed.
* show diff of specific file(s) in commit if possible

# User Stories - Pull Requests
As a **contributor**, I should be able to:
* make a pull request from within Jive.
* discuss the details of the pull request.

As a **person** with the keys to the repository, I should be able to:
* approve pull requests from within Jive.
* see the most recent pull requests.
* see pull requests in the activity feed.

# Fork Us!
You are invited to help us build out this example. We've put together some [developer notes to see user stories](https://community.jivesoftware.com/docs/DOC-126536)
that you can check out. These are our guidelines to keep the project consistent. Jump in and join the fun, and together, let's brew up something awesome!
