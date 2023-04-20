---
heading: Log Alerts
title: Log Alerts
slug: log-alerts
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Logs alerts are a way to get notified when the count of logs for a query is over or under a threshold for a specific time range.

## Creating an alert

[](/images/log-alert.png)

### Query

When you set up an alert, you can include a query to count only the logs that match. The query format follows the same specification as on the logs page. You can read more [here](./log-search.md).

### Alert Threshold

You can control the number of logs needed to trigger an alert by setting an alert threshold. You can choose to alert if the actual log count is above or below this threshold.

### Alert Frequency

You can adjust the time range for which logs are searched and aggregated. Shorter frequencies can be helpful to be alerted quickly about an issue, while longer frequencies can help reduce noise by aggregating across a larger time range.

### Notifications

Log alerts can be configured to notify you via Slack, Discord, email, or webhooks. For more details, see [alerts](../3_general-features/alerts.md).
