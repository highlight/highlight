---
title: 'WebSocket Recording'
createdAt: 2023-07-17T15:57:12.147Z
readingTime: 5
authorFirstName: Spencer
authorLastName: Amarantides
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/SpennyNDaJets'
authorLinkedIn: 'https://www.linkedin.com/in/spencer-amarantides/'
authorGithub: 'https://github.com/SpennyNDaJets'
authorWebsite: ''
authorPFP: 'https://lh3.google.com/u/0/ogw/AGvuzYYcxLXVI9fxSgSPXbQoBw2mpUKll1Kt5hR3LxEh=s64-c-mo'
tags: Developer Tooling, Launch Week 2
metaTitle: Session replay now supports recording WebSocket events
---

Highlight's session replay feature now supports recording WebSocket events. In the past, when viewing a session, you were able to view the network requests and their responses in the Developer Tools. However, any communications using WebSockets were missing from the recording. Starting in version `7.3.0`, Highlight will now record your WebSocket events and display them to help you debug what may be happening behind the scenes. In this blog post, I'll share some of the decisions we made in supporting WebSocket recording and how you can start using it.

![New WebSocket recording feature](/images/blog/web-socket-recording/overview.png)

## Frontend UI/UX

We were between two options for how to display WebSocket messages to our users:
<ol>
  <li>Display messages intertwined with other network requests</li>
  <li>Pull out the messages to their own panel</li>
</ol>

The first option would allow us to better see the relationship between WebSocket messages and other HTTP requests, as they would be in the same table by chronological order. However, the big concern is the WebSocket messages would inundate the table, making it hard to decipher which messages were important. As a result, the WebSocket's open connection request is placed in the request table with the other HTTP requests, but the individual messages related to a WebSocket are pulled out into their own chronological table. While the messages are not intertwined, they will still include a timestamp that can be used to related to the other requests.

![WebSocket messages example](/images/blog/web-socket-recording/messages.png)

## Backend infrastructure

In order to record WebSocket events, the window's `WebSocket` object was monkeypatched when Highlight gets initialized. Event listeners were added to the WebSocket's open, close, error, and message events to record the necessary information to Highlight. In addition, we added a proxy to the WebSocket's send method in order to record when the client sends a message to the WebSocket source.

The WebSocket events are uploaded to S3 storage, but are kept in different files. The `open` and `close` events are stored with the HTTP resources, in order to more easily display them in the Network tab in the correct chronological order. The open event is used to determine the WebSocket's placement, while the close event is used to determine the latency and waterfall fields. Its important to note that the latency represents the time the WebSocket was opened, and not the roundtrip time for a request.

The `send`, `received`, and `error` events are stored in a different S3 file. This file is requested when the user clicks on a specific WebSocket request to avoid loading in unecessary data to the client. It also helps performance since these events do not need to be plucked from a larger list of network resources, but have they own array of relevent events to display.

## Getting Started

Ready to get started with WebSockets? The good news is this feature is on by default for apps using Highlight version `7.3.0` or later. All you need to do is make sure that `networkRecording.recordHeadersAndBody` is set to `true`. If you want to disable WebSocket events from being disabled, then you can set `disableWebSocketEventRecordings` to `true`. More information can be found in the docs: [Recording WebSocket Events](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-web-socket-events).

Stay tuned to everything we're announcing as part of [launch week](https://highlight.io/launch-week)!
