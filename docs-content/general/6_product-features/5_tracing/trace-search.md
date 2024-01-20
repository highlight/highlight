---
title: Trace Search
slug: trace-search
createdAt: 2023-01-17T09:00:00.000Z
updatedAt: 2023-01-17T09:00:00.000Z
---

You can filter traces using a [search query](../../6_product-features/3_general-features/search.md). For example, you can get to all traces produced in the last 15 minutes from a `private-graph` service by selecting "Last 15 minutes" from the time picker and entering the following query:

```
service_name=private-graph
```

For more detailed information on using search, check out our [Search docs](../../6_product-features/3_general-features/search.md).

## Default Key

The default key for traces search is `span_name`. If you enter an expression without a key (`gorm.Query`) it will be used as the key for the expression (`span_name=gorm.Query`).

## Searchable Attributes

You can search on any attributes that you send in your traces as well as any of the default attributes assigned to a trace. Our SDKs will also link [sessions](../1_session-replay/), [errors](../2_error-monitoring/), and [logs](../4_logging/) to their respective traces.

You can view a list of the available attributes to filter on by starting to type in the search box. As you type you'll get suggestions for keys to filter on.
