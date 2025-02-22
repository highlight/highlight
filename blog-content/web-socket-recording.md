---
title: WebSocket Recording
createdAt: 2023-07-17T15:57:12.147Z
readingTime: 5
authorFirstName: Spencer
authorLastName: Amarantides
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/SpennyNDaJets'
authorLinkedIn: 'https://www.linkedin.com/in/spencer-amarantides/'
authorGithub: 'https://github.com/SpennyNDaJets'
authorWebsite: ''
authorPFP: >-
  https://lh3.googleusercontent.com/a/AAcHTteOYM6knTAD-uOPM1JP56Yn4WlsGya6Dpnhq_ak6UJUY3Q=s576-c-no
tags: 'Engineering, Product Updates'
metaTitle: Session replay now supports recording WebSocket events
---

Highlight's session replay feature now supports recording WebSocket events. In the past, when viewing a session, you were able to view the network requests and their responses in the Developer Tools. However, any communications using WebSockets were missing from the recording. Starting in version `7.3.0`, Highlight will now record your WebSocket events and display them to help you debug what may be happening behind the scenes. In this blog post, I'll share some of the decisions we made in supporting WebSocket recording and how you can start using it.

![New WebSocket recording feature](/images/blog/web-socket-recording/overview.png)

## Frontend UI/UX

We were between two options for how to display WebSocket messages to our users:
<ol>
  <li>1. Display messages intertwined with other network request</li>
  <li>2. Pull out the messages to their own panel</li>
</ol>

The first option would allow us to better see the relationship between WebSocket messages and other HTTP requests, as they would be in the same table by chronological order. However, the big concern with that approach was that the WebSocket messages would inundate the table, making it hard to decipher which messages were important. As a result, we decided to put the WebSocket's open connection request in the request table with the other HTTP requests, and keep the individual messages related to a WebSocket pulled out into their own chronological table. While the messages are not intertwined, they will still include a timestamp that can be used to related to the other requests.

![WebSocket messages example](/images/blog/web-socket-recording/messages.png)

## Backend infrastructure

In order to record WebSocket events, the window's `WebSocket` object was monkeypatched when Highlight gets initialized. Event listeners were added to the WebSocket's open, close, error, and message events to record the necessary information to Highlight. In addition, we added a proxy to the WebSocket's send method in order to record when the client sends a message to the WebSocket source.

The WebSocket events are uploaded to S3 storage, but are kept in different files. The `open` and `close` events are stored with the HTTP resources, in order to more easily display them in the Network tab in the correct chronological order. The open event is used to determine the WebSocket's placement, while the close event is used to determine the latency and waterfall fields. Its important to note that the latency represents the time the WebSocket was opened, and not the roundtrip time for a request.

The `send`, `received`, and `error` events are stored in a different S3 file. Therefore, at query time, this file is requested when the user clicks on a specific WebSocket request to avoid loading in unecessary data to the client. It also helps performance since these events do not need to be plucked from a larger list of network resources, but have they own array of relevent events to display.

## Getting started

Ready to get started with WebSockets? The good news is it is very simple - starting in Highlight version `7.3.0`, apps that have set `networkRecording.recordHeadersAndBody` to `true` will start recording WebSocket traffic as well. If you want to disable recording WebSocket events, then you can set `networkRecording.disableWebSocketEventRecordings` to `true`, which will not affect the recordings of your other network requests. More information can be found in the docs: [Recording WebSocket Events](https://www.highlight.io/docs/getting-started/browser/replay-configuration/recording-web-socket-events).

Thanks for reading and stay tuned to everything we're announcing as part of [launch week](https://highlight.io/launch-week-day-1)!
