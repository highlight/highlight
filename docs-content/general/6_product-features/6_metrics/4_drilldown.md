---
title: Drilldown
slug: drilldown
createdAt: 2024-08-01T00:00:00.000Z
updatedAt: 2024-08-01T00:00:00.000Z
---

![Logs drilldown](/images/docs/graphing/drilldown.png)

## Overview

Metrics drilldown is a way to look closer at the underlying data from the graphs in your metrics dashboards. You can get started with metrics [here](./1_overview.md).

## Using metrics drilldown

When the tooltip is shown on any graph, you can click to freeze the tooltip and show drilldown links. Clicking on one of these drilldown links will open a panel with the relevant logs, traces, errors, or sessions.

![Drilldown panel](/images/docs/graphing/drilldown_panel.png)

The data points shown in the panel list view are filtered using the graph's filters and the grouping, time range, or metric bucket for the specific data point that was selected. From here, you can click into rows to see an instance view. 

Some resources are also associated with sessions - clicking the session cell will open the session player in the panel.

![Session instance](/images/docs/graphing/drilldown_session_instance.png)

