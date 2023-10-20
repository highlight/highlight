---
title: Performance Impact
slug: performance-impact
createdAt: 2021-10-14T00:18:49.000Z
updatedAt: 2022-08-08T17:50:32.000Z
---

## Overview

When building Highlight, we've made technical decisions that prioritize putting your site's performance first. Highlight's performance impact on your site, therefore, is negligible, both from the perspective of your user's real-time experience as well as from a page-load perspective.

## Bundle Size

Highlight's gzipped bundle size is a [mere 11 kb](https://www.npmjs.com/package/highlight.run). From a page load perspective, your team should have no qualms regarding Highlight's impact on page load metrics.

## DOM Interaction Performance

Highlight uses the well-maintained [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) browser API in order to record DOM mutations. When sending these changes to our platform, we buffer events periodically to ensure that

1.  Events aren't being held in memory for a prolonged time

2.  Outgoing network requests aren't interfering with user interactions

## Network

Your client will send Highlight telemetry about every 3 seconds. We've taken extra care in making sure we don't overwhelm your end user's machine:

1.  Only 1 request will be in-flight at a given time

2.  Responsive to your end user's network speed

## Session Replay

Concerned about session replay impacting your web application? Read our blog post about it [here](https://highlight.io/blog/session-replay-performance).
