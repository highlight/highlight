# RFC: changesets

* Status: Approved
* Author: [@Vadman97](https://github.com/Vadman97)

## Summary

Introduce [Changesets](https://github.com/changesets/changesets) as a workflow for releasing new versions of
highlight javascript SDKs.

## Motivation

We have a number of monorepo javascript packages that depend on one another. Some current problems include: 
* it is not clear which dependencies' versions to bump when you change a package
* we publish new package versions too frequently, making it harder to manage differences between versions
* changelogs / package.jsons must be updated manually in different locations

## Proposed Implementation

Changesets provides a tool for managing the different version bumps with a single command.
A PR does not need to include the boilerplate versioning updates but instead carries the `.changeset/` file
that tracks which version bumps are necessary for a given change.
GitHub actions are set up to automate releases and validate that JS package changes are accompanied by
a changeset.

## Instructions

In a git branch, make changes to the SDKs corresponding to your feature work. Once you are ready to commit, run
```bash
yarn changeset
```

This will walk you through the options for packages that are modified, allowing you to indicate the semantic version
that should be bumped along with a corresponding changelog note. Once you are done with the wizard, you should see a
commit containing the new `.changeset/` file; all you need to do is push it along with your other changes!
