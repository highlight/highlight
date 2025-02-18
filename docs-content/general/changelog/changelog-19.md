---
title: Changelog 19 (05/22)
slug: changelog-19
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/AcIfUZeJjjs"
  title="Youtube"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Demo Project

Check out [our new demo project](https://app.highlight.io/demo).

You can play around and see how the Highlight application works with a live project with plenty of data.

Look closely. You might be able to find your own `highlight.io` sessions recorded on the demo project. That's right! We use Highlight ourselves, and we pipe all of our data to the demo project.

![demo project](/images/changelog/19/demo-project.png)

## Comment UI Facelift

We've given the Comment UI a facelift.

-   It fits better with our design system.
-   We have a new draggable handle just below the session timeline.
-   New inline issue creation for connected issue trackers (GitHub, Linear, Height)

![comment ui facelift](/images/changelog/19/comment-ui.png)

## Winston.js Highlight Transport

Check out our new [Winston.js Highlight Transporter](https://www.highlight.io/docs/getting-started/server/js/winston)!

You can log to Winston as per usual, and Highlight will capture your logs and display them on your Highlight application.

## Canvas recording is getting even more powerful

We dug deep into our most complex Canvas implementation with multiple overlaying canvases on a single page.

We're snapshotting blob videos using Canvas and capturing frames from multiple canvases, regardless of overlays.

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>

## Option to only record session with errors

Highlight users with an enormous number of sessions may not want to record all of them.

You can now opt into error-only recording. If the session throws an error, we'll record it. If not, that session never hits your Dashboard.

![exclude sessions without errors](/images/changelog/19/exclude-sessions-without-errors.png)
