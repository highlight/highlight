---
title: Session Search
slug: session-search
createdAt: 2022-05-06T23:05:46.000Z
updatedAt: 2022-09-12T16:18:46.000Z
---

# Searching by Identifier

In [highlight.io](https://highlight.io), you can search for a session by any of the data you send us (via the SDK) throughout a session. The data you send us can be in the form of [track](../../../getting-started/3_client-sdk/7_replay-configuration/tracking-events.md) or [identify](../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md) calls.

# Searching by User Clicks

When using Highlight, you might be interested in querying for sessions where a user clicked a certain HTML element. Highlight records users' clicks on the page as two queryable properties: `clickSelector` and `clickInnerText`.

1.  `clickSelector` is the HTML Element's target's selector, concatinating the element's `tag`, `id ` and `class` values.

2.  `clickTextContent `is the HTML Element's target's `textContent` property. Only the first 2000 characters are sent.
    1.  This property was added in `highlight.run@^4.2.3`.

You can also visualize what Highlight is tracking by looking at your site's console logs when you click an element of interest. For example, clicking a particular `p` element in [https://app.highlight.io/](https://app.highlight.io/1/sessions?query=and) prints the following in the console logs.

![A sample console message on click.](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/yP5u4tqGinXhIyonAuXV1_image.png)

You can then use the session filters to search for text in the two fields.

![](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/2ckH93jnzBYqpCeeTWOXT_image.png)
