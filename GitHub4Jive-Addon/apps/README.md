GitHub for Jive - Developer Notes
=================================



User Stories
============

As a Jive user with access to the linked Jive place:
<ol>
    <li>I should be able to reference a commit in a rich text editor.
        <ul>
            <li>By Commit name</li>
            <li>By Commit Hash (Sha1)</li>
        </ul>
        Should show at least the files changed, possibly the diff of that commit.<br/><br/>
    </li>
    <li>I should have a place to see all places that have a linked repository. These should link to that place. And show stats of the repository.</li>
    <li>I should be able to look at another Jiver's recent GitHub Activity with recent Commits and Issues with a link to his GitHub page.</li>
</ol>

As a GitHub user with push access:
<ol>
    <li>I should be able to change the state of issues.
        <ul>
            <li>If a discussion or document about an issue is marked official it should change the state to closed.</li>
        </ul>
    </li>
    <li>I should be able to see all places that have a linked repository that I have committed to. Link to that place.</li>
    <li>I should be able to see my own activity about Commits, Issues, and pull requests.</li>
    <li>I should be notified if a pull request is approved or rejected.</li>
</ol>

As a repository owner/admin:
<ol>
    <li>I should be able to approve a pull request from the discussion/document page.
        <ul>
            <li>Also, when I mark a discussion/document as official then it should automatically approve the pull request.</li>
        </ul>
    </li>
</ol>

As a place owner/admin:
<ol>
    <li>I should be able to link a repository to a place.</li>
    <li>Unlink a repository. Turning off all activity feed updates.</li>
</ol>