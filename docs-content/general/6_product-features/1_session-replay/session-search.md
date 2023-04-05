---
title: Session Search
slug: session-search
createdAt: 2022-05-06T23:05:46.000Z
updatedAt: 2022-09-12T16:18:46.000Z
---

# Searching by Identifier

In [highlight.io](https://highlight.io), you can search for a session by any of the data you send us (via the SDK) throughout a session. The data you send us can be in the form of [track](../../../getting-started/3_client-sdk/7_replay-configuration/tracking-events.md) or [identify](../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md) calls.

## Track Searching
For track calls, you can search for sessions based on the properties that have a type of `track`. This looks like the following:

![](/images/track.png)

## Identify Searching
For identify calls, you can search for sessions based on the properties that have a name of `identify`, and the value corresponds to the value sent to the first argument of `H.init` (see [here](../../../sdk/client.md)). This looks like the following.

![](/images/identify.png)

## Searching by User Clicks

When using Highlight, you might be interested in querying for sessions where a user clicked a certain HTML element. Highlight records users' clicks on the page as two queryable properties: `clickSelector` and `clickInnerText`.

- `clickSelector` is the HTML Element's target's selector, concatinating the element's `tag`, `id ` and `class` values.

- `clickTextContent `is the HTML Element's target's `textContent` property. Only the first 2000 characters are sent.

You can then use the session filters to search for text in the two fields. An example of what the `clickSelector` filter lookgs like is below:

![](/images/click-selector.png)
