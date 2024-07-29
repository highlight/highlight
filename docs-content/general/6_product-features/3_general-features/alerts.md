---
title: Alerts
slug: alerts
createdAt: 2021-09-14T00:14:56.000Z
updatedAt: 2024-07-29T12:00:00.000Z
---

Alerts are a way to keep your team in the loop as to what is happening on your app. Below is a description of the common components of Alerts, and more specific parameters are included in subsequent sections. To get started, visit [app.highlight.io/alerts](https://app.highlight.io/alerts). The basic parameters for an alert look like the following image:

![Alerts Form](/images/features/alertsForm.png)

## Picking a Source

This input allows you to create alerts based on sessions, errors, logs, traces, or metrics all in one single form. It uses the same data seen on the
search pages.

## Functions

Functions allow for more powerful alerts from simple counts to percentiles of data. These percentile alerts are typically used on the duration of
traces to create alerts when the latency is higher than a threshold.

## Filters

Add filters, exactly like the search experiences, to filter out any unwanted data from be used in the alert evaluation. For more information on the
search, please visit our [Search docs](./search.md).

## Cooldown

Avoid being over alerted by setting a cooldown time. After the initial notification, the alert will not send additional notifications for this amoun
of time. If the alert is still in an alert state after the cooldown, another notification will be sent to your added channels.

## Distinct Alerts

You can create distinct alerts based on a key in the data to provide more information about the alert. In the example above, the `service_name` is used
to group the data and send an alert distict to the service name. In the example, the "all" and "frontend" services would be in an "alert" state, while
the "private-graph" service is resolved.

## Notifications

An alert can be sent to the following channels:
- Slack
- Discord
- Microsoft Teams
- Email
- Webhooks

If your workspace has not yet integrated with one of the channels you are trying to add, you will be redirected to set up the appropriate integration. Once
an alert has been created or updated with a channel, a test notification will be sent notifying that it is now being used in a Highlight alert.

## Webhook Notifications

All alerts can route notifications to webhooks via a HTTP POST JSON payload. Learn more about [configuring webhooks](./webhooks.md).
