---
title: Canvas & Iframe
slug: canvas-iframe
---

## Recording `canvas` elements

[highlight.io](https://highlight.io) supports recording canvas (and therefore WebGL) elements, although due to the nature of `canvas`, there are caveats regarding the quality/fidelity of the recording. Read more about how to get started with this in our [canvas configuration docs](../../../getting-started/3_browser/7_replay-configuration/canvas.md). Below is a video demo of what the video recording looks like:

<br/>

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>


## Installing highlight.io in an `iframe`

The highlight.io snippet supports recording within an iframe, but given the security limitations, there are caveats. Read more about this in our [sdk configuration docs](../../../getting-started/3_browser/7_replay-configuration/iframes.md#recording-within-iframe-elements).

## Recording Cross-origin `iframe`s

To support recording a cross-origin iframe that you own, we've added functionality into our recording client that allows the iframe to forward its events to the parent session. Read more about this in our [sdk configuration docs](../../../getting-started/3_browser/7_replay-configuration/iframes.md#recording-a-cross-origin-iframe-element).

If you do not own the parent page that is embedding your iframe cross-origin but you still want to record the iframe contents, pass `recordCrossOriginIframe: false` to the `H.init` options to force the iframe to record as a standalone app.
Otherwise, the iframe will wait for the parent page to start recording.
