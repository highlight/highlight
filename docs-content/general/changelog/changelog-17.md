---
title: Changelog 17 (04/07)
slug: changelog-17
---

![](/images/setup.png)
## New setup page just dropped!
We just launched a new setup page that makes it easier to get started with highlight.io. Check it out at https://app.highlight.io/setup.

## Ability to turn off session caching for high-memory playback.
For customers that run a very memory-intensive stack (using canvas recording, or even with lots of changes happening in the dom), the local session player can occosianally slow down the browser tab. We've added a new option to the highlight.io config to turn off session caching. 

[PR Link](https://github.com/highlight/highlight/pull/4758)

## Setting up alerts no longer require a slack connection.
Before this change, there was a bug that made it difficult to set up alerts without a slack channel. This is no longer the case.

[PR LInk](https://github.com/highlight/highlight/pull/4748)

## Docs and landing (at highlight.io) now live in our main repo.
Its now easier to contribute to our docs and landing page now that they both live in the same repo!

[PR Link](https://github.com/highlight/highlight/pull/4703)

## Support for codespaces for contributors.
Interested in contributing to highlight.io? Its now easier than ever to get started with our new codespaces setup. Check out our contributing guide for more info.

[PR Link](https://github.com/highlight/highlight/pull/4669)
