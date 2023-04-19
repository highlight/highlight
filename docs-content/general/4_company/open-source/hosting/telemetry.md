---
title: Telemetry
slug: telemetry
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## Our Telemetry Philosophy

Telemetry helps us understand how folks use highlight, what operating systems and hardware capabilities they have, and what features they use most. The metrics we collect are anonymized so that we can associate usage with a particular deployment, but never with a particular user email or name. We use our own highlight cloud product to collect metrics, so you can find exactly how the telemetry metrics are recorded and then stored + queried. Check out the [telemetry code here](https://github.com/highlight/highlight/blob/main/backend/phonehome/phonehome.go) to learn more.

When you start highlight for development or a hobby deploy, our scripts will ask you to confirm your telemetry settings. You can always change them later by modifying the value in `backend/.config/v1.json` to enable or disable telemetry reporting. 

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
