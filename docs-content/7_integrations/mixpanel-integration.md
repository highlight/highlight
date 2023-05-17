---
title: Mixpanel Integration
slug: mixpanel-integration
createdAt: 2021-09-13T23:57:09.000Z
updatedAt: 2021-12-03T23:56:06.000Z
---

We've made it easy to use Mixpanel with Highlight. If you don't already have Mixpanel initialized in your app, you can have Highlight initialize it for you by specifying your Mixpanel Project Token in the config.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    mixpanel: {
      projectToken: '<MIXPANEL_PROJECT_TOKEN>',
    },
  },
})
```

Whenever you call [`H.track()`](../sdk/client.md#Htrack) or [`H.identify()`](../sdk/client.md#Hinit) it will forward that data to Mixpanel's `track` and `identify` calls. If you want to disable this behavior, you can set `enabled: false` for the integration:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    mixpanel: {
      enabled: false,
    },
  },
})
```

## API

### `track()`

Calling [`H.track()`](../sdk/client.md#Htrack) will forward the data to Mixpanel's `track()`. Highlight will also add a Mixpanel property called `highlightSessionURL` which contains the URL to the Highlight session where the track event happened.

### `identify()`

Calling [`H.identify()`](../sdk/client.md#Hidentify) will forward the data to Mixpanel's `identify()`.
