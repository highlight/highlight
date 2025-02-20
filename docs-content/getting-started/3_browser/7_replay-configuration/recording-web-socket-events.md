---
title: Recording WebSocket Events
slug: recording-web-socket-events
createdAt: 2023-07-17T12:38:18.987Z
updatedAt: 2023-07-17T13:31:16.988Z
---

Highlight also allows you to record all of your WebSocket events in your sessions. It will display WebSocket events, such as opening a connection, sending and receiving messages, receiving an error, and closing a connection.

Enabled this feature by setting `networkRecording.recordHeadersAndBody` (see [NetworkRecordingOptions](../../../sdk/client.md#Hinit)) to `true` when initializing Highlight. If you want to disable WebSocket events, but keep recording the headers and bodies of network requests, you can set `networkRecording.disableWebSocketEventRecordings` to `true`.

Highlight monkey patches the `WebSocket` object to add event listeners to the respective methods when the WebSocket is initialized.

## Recording WebSocket Events

Highlight can also record WebSocket events. WebSockets will display the initial open connection with the other network requests in the session Developer Tools. The WebSocket request can be clicked on to view the related messages and events.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
})
```

## Disabling WebSocket Events

WebSocket event recording can be disabled without affecting the other network requests by setting `networkRecording.disableWebSocketEventRecordings` to `true`.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    disableWebSocketEventRecordings: true
  },
})
```

## API

See [NetworkRecordingOptions](../../../sdk/client.md) for more information on how to configure network recording.

WebSocket event recording is only available for `highlight.run` versions newer than `7.3.0`.