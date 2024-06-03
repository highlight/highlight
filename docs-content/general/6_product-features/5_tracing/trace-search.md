---
title: Trace Search
slug: trace-search
createdAt: 2023-01-17T09:00:00.000Z
updatedAt: 2024-05-15T00:00:00.000Z
---

Trace search allows you to filter on spans of traces in your product based on a query, and allows you to see more information on
an overarching trace by clicking into a span. You can filter spans using a [search query](../../6_product-features/3_general-features/search.md)
For example, you can get to all spans of traces produced in the last 15 minutes from a `private-graph` service by selecting "Last
15 minutes" from the time picker and entering the following query:

```
service_name=private-graph
```

## Searching for sessions

For general information on searching traces, check out our [Search docs](../../6_product-features/3_general-features/search.md).

## Default Key

The default key for trace search is `span_name`. If you enter an expression without a key (`gorm.Query`) it will be used as the
key for the expression (`span_name=*gorm.Query*`).

## Searchable Attributes

You can search on any attributes that you send in your traces as well as any of the default attributes assigned to a trace.
Our SDKs will also link [sessions](../1_session-replay/),[errors](../2_error-monitoring/), and [logs](../4_logging/) to their
respective traces.

The autoinjected attributes for traces can be seen in the table below.

| Attribute           | Description                                        | Example                                                                                                                                             |
|---------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `duration`          | Time length of the span in nanoseconds             | `10s`                                                                                                                                               |
| `environment`       | The environment specified in the SDK               | `production`                                                                                                                                        |
| `has_errors`        | If the span has an error tied to its id            | `true`                                                                                                                                              |
| `highlight.type`    | More specific source of the span                   | `http.request`                                                                                                                                      |
| `parent_span_id`    | Span id of the span's parent                       | `327611203ec5b0a1`                                                                                                                                  |
| `secure_session_id` | Session id that contains this span                 | `wh1jcuN5F9G6Ra5CKeCjdIk6Rbyd`                                                                                                                      |
| `service_name`      | Name of the service specified in the SDK           | `private-graph`                                                                                                                                     |
| `service_version`   | Version of the service specified in the SDK        | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                                          |
| `span_kind`         | Broad source of the span                           | `Server`                                                                                                                                            |
| `span_name`         | Title of the span                                  | `POST https://app.highlight.io`                                                                                                                     |
| `trace_id`          | Trace id of the spans                              | `7654ff38c4631d5a51b26f7e637eea3c`                                                                                                                  |

You can view a full list of the available attributes to filter on by starting to type in the search box. As you type you'll get
suggestions for keys to filter on.

## Helpful Tips

To see all the spans of a specific trace, you can filter by `trace_id` to get a table view of the spans. You can also
click into the span to get more information, including a flame graph of the trace with all its spans.

Use `secure_session_id EXISTS` to only see spans that are tied to a session.

Use time suffixes, such as `s`, `ms` and `us` to help filter out for span durations. For example, use `duration>1s` to find
all spans that were longer than 1 second.