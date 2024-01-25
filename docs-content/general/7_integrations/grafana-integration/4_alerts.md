---
title: Alerts
slug: alerts
createdAt: 2021-09-17T21:48:44.000Z
updatedAt: 2021-09-17T21:56:27.000Z
---

The highlight.io plugin for Grafana supports creating alerts that can be configured to notify you when a metric exceeds its normal range.

## Configuring an alert rule

From the alerting page, you can create a new alert rule. Choose the highlight.io data source you [configured](./2_setup.md) earlier. You can create alerts on top of any numeric highlight.io query. The main difference between configuring a query for a visualization versus an alert is that for an alert, you will often want to disable bucketing in order to get a single value for the time range rather than a time series result. Bucketing by Timestamp will require a Reduce step in order to apply a threshold.

Bucketing by Timestamp (default):
![Bucketing by Timestamp](/images/docs/grafana/timestamp-bucketing.png)

No Bucketing:
![No Bucketing](/images/docs/grafana/no-bucketing.png)

Alerts are not limited to errors - you can create them on top of any highlight.io resource, e.g. to be notified when a certain network resource is taking too long to respond or when your count of current active users drops below some threshold.
