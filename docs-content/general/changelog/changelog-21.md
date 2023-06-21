---
title: Changelog 21 (06/21)
slug: changelog-21
---

## GitHub Authentication

By popular request, we've implemented [GitHub sign up](https://github.com/highlight/highlight/pull/5584). We've linked it to your primary GitHub email through Firebase authentication.

## Invite detection

Many users come directly to Highlight because their team is using the product but they don't realize that they need to come through an invite link in order to join their workspace.

We now check for available workspace invitations on sign up, so team members will be more likely to join their workspace as intended.

![invite detection](/images/changelog/21/invite-detection.png)

## AllContributor GitHub App

We've installed the [AllContributor](https://allcontributors.org/docs/en/bot/installation) GitHub app and integrated it with our codebase.

![all contributors](/images/changelog/21/all-contributors.png)

## New Slack Embed

We already support tagging a Slack channel in a session comment.

Now we take a screenshot of that session and embed it in the Slack channel to add extra context to the message.

![Slack embed](/images/changelog/21/slack-embed.png)

## Hobby Deploy off localhost

The Hobby Deploy assumed that it would always host itself on `localhost`.

We fixed that issue by passing `REACT_APP_PRIVATE_GRAPH_URI` and `REACT_APP_PUBLIC_GRAPH_URI` to the Docker containers, so you can configure the endpoints to run on any domain you like.

## Python 3.11 Support

Our SDK now supports Python 3.11.





