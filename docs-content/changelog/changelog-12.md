---
title: Changelog 12 (02/17)
slug: changelog-12
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

## Open Source!

highlight.io is open source at [https://github.com/highlight/highlight](https://github.com/highlight/highlight) (would appreciate a star ⭐️). We've also got lots of updates to share on this front as we grow, so stay tuned!

## Changing the status of an error is now instant!

We're now using `optimisticResponses` in apollo to update the state of an error. When you change the status, this now happens instantly in the UI 🤯.

[PR Link](https://github.com/highlight/highlight/pull/4246)

## Smoother frontend routing logic.

We upgraded react router this week, which has made some significant performance improvements to the app; switching between errors/sessions is now silky smooth.

[PR Link](https://github.com/highlight/highlight/pull/4203)

## New SDKs!!

We now support several more Python SDKs: Flask, Django, Python Azure Functions.

[Python Docs](https://www.highlight.io/docs/general/2_getting-started/backend-sdk/python)

[Cloudflare Docs](https://www.highlight.io/docs/general/2_getting-started/backend-sdk/cloudflare)
