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

## Events forwarded to LaunchDarkly Client

### 

## Highlight APIs forwarded to LaunchDarkly

### `init()`

Calling [`H.init()`](../../sdk/client.md#Hinit) will forward the data to LaunchDarkly's `track()` as a `$ld:telemetry:initialize` event
to represent the initialization of a session.

### `track()`

Calling [`H.track()`](../../sdk/client.md#Htrack) will forward the data to LaunchDarkly's `track()` as a `$ld:telemetry:track` event. 

### `consumeError()`

Calling [`H.consumeError()`](../../sdk/client.md#Hidentify) will forward the data to LaunchDarkly's `track()` as a `$ld:telemetry:error` event.

### `recordMetric()`

Calling [`H.recordMetric()`](../../sdk/client.md#HrecordMetric) will forward the metric value to LaunchDarkly's `track()` as a `$ld:telemetry:metric` event.

## LaunchDarkly APIs forwarded to Highlight

### `ldClient.identify()`

Calling [`ldClient.identify()`](https://launchdarkly.github.io/js-client-sdk/interfaces/LDClient.html#identify) will 
forward the data to Highlight's `H.identify()`.

### `ldClient.variation()`

Calling [`ldClient.variation()`](https://launchdarkly.github.io/js-client-sdk/interfaces/LDClient.html#variation) will 
forward the data to Highlight's `H.track()` and record the flag evaluation as a span in the current trace.