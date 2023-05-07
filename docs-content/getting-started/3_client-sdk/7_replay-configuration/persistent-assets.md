---
title: Persistent Asset Storage
slug: persistent-assets
createdAt: 2021-10-13T22:55:19.000Z
updatedAt: 2022-09-29T18:01:58.000Z
---

## Persistent Asset Storage

When Highlight records your HTML DOM, media assets including fonts, stylesheets, videos, and images are referenced by their original source URL.
This means that playing a session after it was recorded may lead to discrepancies in the replay if any of the assets change.

For example, consider the following HTML element
```html
<video
    preload="metadata"
    autoPlay={true}
    crossOrigin="anonymous"
    src="https://static.highlight.io/dev/BigBuckBunny.mp4"
></video>
```

When a session is recorded, we will record this element as is, storing the video playback time and any seek events as they happen.
If the contents of https://static.highlight.io/dev/BigBuckBunny.mp4 change after the session is recorded, the playback
will be inconsistent with what a user actually saw, since the video file will differ.

To ensure pixel-perfect replay, we have an **Enterprise tier** feature to persist these assets alongside our secure session storage.
With this feature enabled, the replay will render this element as
```html
<video
    preload="metadata"
    autoPlay={true}
    crossOrigin="anonymous"
    src="https://pri.highlight.io/assets/1/bxvdqlD_55hvnUuAo-NTiyiLOqeobyMatWjgmLFZhH0~"
></video>
```
where https://pri.highlight.io/assets/1/bxvdqlD_55hvnUuAo-NTiyiLOqeobyMatWjgmLFZhH0~ will be the video file saved at the time of the recording.
The asset will be persisted as long as your session is retained.

[Upgrade your plan](https://www.highlight.io/pricing) and  [reach out to us to enable the feature](https://highlight.io/community)!
