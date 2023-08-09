---
title: Changelog 22 (08/07)
slug: changelog-22
---

## Remix SDK at v0

Remix works great with Highlight. It was surprisingly easy to instrument.

Check out our [@highlight-run/remix docs](https://www.highlight.io/docs/getting-started/fullstack-frameworks/remix) for an easy walkthrough.

![Remix to Highlight](/images/changelog/22/remix-to-highlight.jpg)

## Render.com Log Stream

Quickly and easily configure a Render log drain with Highlight: https://dub.sh/UmfNHwu

![Render to Highlight](/images/changelog/22/render-to-highlight.jpg)


## Canvas Manual Snapshotting

[@Vadman97](https://github.com/Vadman97) solved a long-standing issue with WebGL double buffering. The WebGL memory would render a transparent image even though the GPU was rending the image correctly. This caused missing images in Session Replay.

Take full control over your Canvas snapshots with the [manual snapshotting docs](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/canvas#manual-snapshotting)

![Render to Highlight](/images/changelog/22/canvas-snapshot.jpg)


## Set "Service Name" and "Service Version" with the Python and Go SDKs

We've added `service_name` and `service_version` parameters to the [Python SDK](https://www.highlight.io/docs/sdk/python#servicename) and the [Go SDK](https://www.highlight.io/docs/sdk/go#highlightStart).

These params make logs much more searchable.

![Python Service Name](/images/changelog/22/service-name.png)

## 🚨Community Contribution 🚨 

#### Repaired scrolling in metadata

Shout out to to Kalkidan Betre—[@kalibetre](https://github.com/kalibetre) on GitHub—for their open source contribution. They noticed that our Metadata window on the Session Replay screen wasn't scrolling correctly, and they sent in a pull request to fix it.

Thanks Kalkidan!

![Metadata scroll](/images/changelog/22/metadata-scroll.gif)

