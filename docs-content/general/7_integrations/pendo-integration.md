---
title: Pendo Integration
slug: pendo-integration
createdAt: 2021-09-13T23:57:09.000Z
updatedAt: 2021-12-03T23:56:06.000Z
---

```hint
Highlight's Pendo integration is in alpha. In order to use it, you must request access from Highlight [support](mailto:support@highlight.io).
```

We've made it easy to use Pendo with Highlight. If you don't already have Pendo initialized in your app, you can have Highlight initialize it for you by specifying your Pendo Project Token in the config.


```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    pendo: {
      projectToken: '<PENDO_PROJECT_TOKEN>',
    },
  },
})
```

Whenever you call [`H.track()`](../../sdk/client.md#Htrack) or [`H.identify()`](../../sdk/client.md#Hinit) it will forward that data to Pendo's `track` and `identify` calls. If you want to disable this behavior, you can set `enabled: false` for the integration:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    pendo: {
      enabled: false,
    },
  },
})
```

## API

### `track()`

Calling [`H.track()`](../../sdk/client.md#Htrack) will forward the data to Pendo's `track()`. Highlight will also add a Pendo property called `highlightSessionURL` which contains the URL to the Highlight session where the track event happened.

### `identify()`

Calling [`H.identify()`](../../sdk/client.md#Hidentify) will forward the data to Pendo's `identify()`.
