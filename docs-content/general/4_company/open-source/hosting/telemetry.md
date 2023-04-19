---
title: Telemetry
slug: telemetry
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## How Telemetry works for self-hosted deploys

Telemetry helps us understand how folks use highlight, what operating systems and hardware capabilities they have, and what features they use most. The metrics we collect are anonymized so that we can associate usage with a particular deployment, but never with a particular user email or name. We use our own highlight cloud product to collect metrics, so you can find exactly how the telemetry metrics are recorded and then stored + queried. Check out the [telemetry code here](https://github.com/highlight/highlight/blob/main/backend/phonehome/phonehome.go) to learn more.

When you start highlight for development or a hobby deploy, our scripts will share the telemetry policy. If you'd like to disable telemetry, you can do so by editing the `IsOptedOut` function in `backend/phonehome/phonehome.go`. For a hobby deploy, you'll need to build the docker images from source to persist such a change.

## Heartbeat Metrics

| Name       | Description            | Type   |
|------------|------------------------|--------|
| num-cpu    | CPU Count              | int    |
| mem-used   | Bytes of memory used   | int    |
| mem-active | Bytes of memory active | int    |
| version    | Highlight version sha  | string |

## Self-reported User Attributes

| Name               | Description           | Type   |
|--------------------|-----------------------|--------|
| about-you-role     | Engineering / Product | string |
| about-you-referral | Site visit referrer   | string |

## Usage Metrics

| Name               | Description                 | Type |
|--------------------|-----------------------------|------|
| backend-setup      | Is a backend SDK integrated | bool |
| session-count      | Number of sessions recorded | int  |
| error-count        | Number of errors recorded   | int  |
| log-count          | Number of logs recorded     | int  |
| session-view-count | Number of sessions viewed   | int  |
| error-view-count   | Number of errors viewed     | int  |
| log-view-count     | Number of logs viewed       | int  |
