---
title: Intercom Integration
slug: intercom-integration
createdAt: 2021-12-03T23:56:12.000Z
updatedAt: 2021-12-09T00:20:50.000Z
---

Highlight makes it easy to send events to Intercom. If you have both Highlight and Intercom already configured, then you're all set. We've already set things up for you in the background.

If you want to disable this integration, you can set `enabled: false` for the integration in your client config:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    intercom: {
      enabled: false,
    },
  },
})
```

## Messaging

Whenever a user sends you a message on Intercom, Highlight will add a [custom user attribute](https://www.intercom.com/help/en/articles/179-send-custom-user-attributes-to-intercom) called `highlightSessionUrl` to the user. This is the URL for the latest session created by that user. This is helpful to see what the user was doing that led up to the user sending a message.

## API

### `trackEvent`

Calling [`H.track`](../../sdk/client.md#Hinit) will forward the data to Intercom's [`Intercom('trackEvent')`](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomtrackevent).

```typescript
H.track('signup_button_clicked', {
  firstTime: true,
  impressions: 10,
})

// The Highlight track call is equivalent to this Intercom call
Intercom('trackEvent', 'signup_button_clicked', {
  firstTime: true,
  impressions: 10,
})
```
