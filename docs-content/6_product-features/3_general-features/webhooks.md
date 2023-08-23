---
title: Webhooks
slug: webhooks
createdAt: 2021-09-14T00:14:56.000Z
updatedAt: 2021-09-14T19:03:52.000Z
---

All alerts can route notifications to webhooks via a HTTP POST JSON payload. For example, if you are hosting an HTTP webserver listening on `https://example.com/api/webhook`, you can [configure alerts on Highlight](https://app.highlight.io/alerts).

To add an outgoing webhook destination, edit an [alert](https://app.highlight.io/alerts) and set the destination URL.

![](/images/webhook.png)

Here's an example of a payload that is sent.

```json
{
  "Event": "ERROR_ALERT",
  "ErrorCount": 1,
  "ErrorTitle": "Oh no! An error occurred",
  "SessionURL": "https://app.highlight.io/1/sessions/",
  "ErrorURL": "https://app.highlight.io/1/errors/sqavrqpCyrkOdDoYjMF7iM0Md2WT/instances/11493",
  "UserIdentifier": "vadim@highlight.io",
  "VisitedURL": "https://app.highlight.io/1/alerts"
}
```

Session alerts, user alerts, and metric monitors can all send webhook notifications. The payload resembles a similar format for all notification types.

If you are interested in customizing the payload or authenticating the webhook request with an authorization header, follow this [issue on GitHub](https://github.com/highlight/highlight/issues/4697) for updates.

<RoadmapItem title="Webhook Payload Customization & Authentication" number="4697" link="https://github.com/highlight/highlight/issues/4697" linkText="Outgoing Webhook Enhancements" />
