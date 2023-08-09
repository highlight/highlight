---
title: Segment Integration
slug: segment-integration
createdAt: 2021-10-18T22:03:24.000Z
updatedAt: 2022-06-13T15:44:38.000Z
---

If you have an existing codebase calling [Segment's](https://segment.com/docs/connections/spec/) `identify()` and `track()` methods, then you won't have to call Highlight's. Highlight will automatically forward data sent to Segment to your Highlight sessions.

```hint
We are currently working with Segment on an official integration where you can enable, configure, and send data to Highlight. If you'd like to use this, then [upvote this feature request](https://highlight.canny.io/feature-requests/p/official-segment-integration).
```

## Enabling the Segment Integration

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableSegmentIntegration: true,
})
```

Segment's `identify()` calls will now start forwarding to Highlight.

## Enabling Track data forwarding

To forward `analytics.track()` calls to Highlight, you will need to use the `HighlightSegmentMiddleware`. This is available in the `highlight.run` package starting in version `2.10.0`.

```javascript
import { H, HighlightSegmentMiddleware } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  enableSegmentIntegration: true,
})
analytics.addSourceMiddleware(HighlightSegmentMiddleware)
```

## Searching for segment events

Searching for segment events is as easy as using the `segment-event` filter in the session search UI. This is what it looks like. 

![](/images/segment-search.png)
