---
title: Canvas & Iframe
slug: canvas-iframe
---

Highlight.io supports recording canvas elements (and therefore anything related to WebGL) as well as recording cross-origin iframes. Below is a video recording of what this looks like in action:


## Recording `canvas` elements

[highlight.io](https://highlight.io) supports recording canvas (and therefore WebGL) elements, although due to the nature of `canvas`, there are caveats regarding the quality/fidelity of the recording. Read more about how to get started with this in our [getting started docs](../../../getting-started/3_client-sdk/7_replay-configuration/canvas.md).

## Installing highlight.io in an `iframe`

The highlight.io snippet supports recording within an iframe, but given the security limitations, there are caveats. Read more about this in our [sdk configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/iframes.md#recording-within-iframe-elements).

## Recording Cross-origin `iframe`s

To support recording a cross-origin iframe that you own, we've added functionality into our recording client that allows the iframe to forward its events to the parent session. Read more about this in our [sdk configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/iframes.md#recording-a-cross-origin-iframe-element).
