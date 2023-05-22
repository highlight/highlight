---
title: Changelog 19 (05/22)
slug: changelog-19
---

## Demo Project

Check out [https://app.highlight.io/demo](https://app.highlight.io/demo) to check out our new demo project.

You can play around and see how the Highlight Dashboard works with a fully-featured project with plenty of live data.

## Winston.js Highlight Transport

Check out our new [Winston.js Highlight Transporter](https://www.highlight.io/docs/getting-started/backend-logging/js/winston)!

You can log to Winston as per usual, and Highlight will capture your logs and display them on your Highlight Dashboard.

## Canvas recording is getting even more powerful

We dug deep into our most complex Canvas implementation with multiple overlaying canvases on a single page.

We're snapshotting blob videos using Canvas and capturing frames from multiple canvases, regardless of overlays.

## Error-only Session Recording

Highlight users with an enormous number of sessions may not want to record all of them.

You can now opt into error-only recording. If the session throws an error, we'll record it. If not, that session never hits your Dashboard.

![exclude sessions without errors](/images/changelog/exclude-sessions-without-errors.png)