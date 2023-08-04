---
title: Changelog 22 (08/04)
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

[@Vadman97](https://github.com/Vadman97) solved a long-standing issue with WebGL double buffering. The WebGL memory would render a transparent image even though the GPU was rending the image correctly. This cause missing images in Session Replay.

Take full control over your Canvas snapshots with the [manual snapshotting docs](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/canvas#manual-snapshotting)

![Render to Highlight](/images/changelog/22/canvas-snapshot.jpg)



