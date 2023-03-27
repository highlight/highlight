---
title: iframe Recording
slug: iframe-recording
createdAt: 2022-04-14T16:12:23.000Z
updatedAt: 2022-04-19T18:48:07.000Z
---

## Recording within `iframe` elements

- Highlight will recreate an `iframe` with the same src. The `iframe` will not load if the src's origin has a restrictive X-Frame-Options header.

- Highlight only supports recording same-origin iframes because of browsers' same-origin policy. If it's possible to init Highlight within the
  `iframe `, you can record the events within as a separate session in your same project.

- If your
  `iframe ` source becomes invalid after some time or will not render content when inserted in a different domain or website, the recording will not show the correct content that the user saw.

![rendering in a session replay](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/UP4LVunHyPBCzRukQwoh4_image.png)

## Recording a cross-origin `iframe` element

[Cross-origin iframes](https://learn.microsoft.com/en-us/skype-sdk/ucwa/cross_domainiframe) are `<iframe>` elements in your app that reference a domain considered to be of a [different origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). When your iframe uses a `src` tag pointing to a different origin, the iframe is not accessible from the parent page. However, the iframe can still emit messages that the parent page can hear.

To support cross-origin iframes, we added functionality into our recording client that allows the iframe to forward its events to the parent session. All you need to do is add the Highlight snippet to both the parent window and the iframe.

Ensure you are using [highlight.run](https://www.npmjs.com/package/highlight.run) 5.2.0 or newer. Then, add the following option to the `H.init` call **inside of your iframe**.

```typescript
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  isCrossOriginIframe: true,
})
```

Ensure that you add the `H.init` call to both the parent page and the iframe page, but that you only set `isCrossOriginIframe` **in the H.init call of your iframe**. Otherwise your sessions will not be recorded.
