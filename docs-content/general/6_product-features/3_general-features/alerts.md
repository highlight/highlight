---
title: Alerts
slug: alerts
createdAt: 2021-09-14T00:14:56.000Z
updatedAt: 2021-09-14T19:03:52.000Z
---

Alerts are a way to keep your team in the loop as to what is happening on your app. Below is a description of the common components of Alerts, and more specific parameters are included in subsequent sections. To get started, visit [app.highlight.io/alerts)(https://app.highlight.io/alerts). The basic parameters for an alert look like the following image:

![](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/NqoXlpImTuC1Hc_41ekn5_5d8b382-alerts-basic.png)

## Connecting a Slack Channel

If you haven't already integrated Highlight with Slack, clicking the "Channels To Notify" dropdown will prompt you to select a channel. Once this is done, you can add any number of channels to be pinged when an alert is thrown.

## Excluding Environments

You may want to exclude certain environments from generating alerts. For example, in your team's dev environment, it's unlikely that you want to be notified of every error. You can do this by adding an excluded environment option.

Learn more about [Environments](../3_general-features/environments.md).

## Webhook Notifications

All alerts can route notifications to webhooks via a HTTP POST JSON payload. Learn more about [configuring webhooks](./webhooks.md).
