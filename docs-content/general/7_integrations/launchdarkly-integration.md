---
title: LaunchDarkly Integration
slug: launchdarkly-integration
createdAt: 2025-04-03T23:57:09.000Z
updatedAt: 2025-04-03T23:57:09.000Z
---

We've made it easy to use LaunchDarkly with Highlight.

The integration will allow you to report Feature Flag Evaluations to Highlight
and to send the LaunchDarkly identification context to your Highlight session.

Conversely, it will hook into the Highlight SDK and send the user context to LaunchDarkly.

```typescript
H.init("<YOUR_PROJECT_ID>", {});
const ldClient = initialize("<YOUR_LD_CLIENT_TOKEN>");
H.registerLD(ldClient);
```

## API

### `track()`

Calling [`H.track()`](../../sdk/client.md#Htrack) will forward the data to LaunchDarkly's `track()`. 

### `identify()`

Calling [`H.identify()`](../../sdk/client.md#Hidentify) will forward the data to LaunchDarkly's `identify()`.
