---
title: SQL Editor
slug: sql-editor
createdAt: 2025-01-27T00:00:00.000Z
updatedAt: 2025-01-27T00:00:00.000Z
---

The SQL editor lets you write custom `SELECT` queries to retrieve your highlight.io data and aggregate it in useful ways. This is an alternative to the query builder, useful when you need to do more complex transformations to your data. The output is displayed in the same charts and tables supported by the query builder.

![SQL editor](/images/docs/graphing/sql_editor.png)

## ClickHouse SQL
Highlight.io metadata is stored in ClickHouse, and the SQL editor supports the ClickHouse SQL dialect. For questions about supported syntax or functions, you can check out the ClickHouse [docs](https://clickhouse.com/docs/en/sql-reference).

## Time series data
We added a built-in macro `$time_interval(<duration>)` to make time series queries easier to write. On our backend, this macro expands to `toStartOfInterval(Timestamp, <duration>)`. You can use this macro to group results by their timestamp. For example, returning a count for every hour:
```sql
SELECT $time_interval('1 hour'), count()
FROM logs
WHERE service_name='prod'
GROUP BY 1
```
For more details, you can read about the `toStartOfInterval` function in the ClickHouse [docs](https://clickhouse.com/docs/en/sql-reference/functions/date-time-functions#tostartofinterval).

## Date range filtering
The dashboard's date range is applied as a filter to all SQL queries. For example, if your graph uses `SELECT count() FROM logs` and the dashboard's filter is `Last 4 hours`, your result will only include logs within the last 4 hours. A `WHERE` clause will filter in addition to the date range filter and will not include results outside the 4 hour range. Graphs will be updated dynamically whenever the dashboard's date range is updated.

## Multiple series
To display multiple series, you can include multiple select expressions. For example, graphing an hourly count and average duration of all traces:
```sql
SELECT $time_interval('1 hour'), count(), avg(duration)
FROM traces
GROUP BY 1
```

## Querying custom fields
Behind the scenes, we transform your SQL to simplify queries over our schema. Custom fields and metadata can be recorded with all highlight.io logs, traces, sessions, and errors. This data is stored without any type metadata on our backend - for numeric aggregations, you should first convert it to the appropriate type. For example, if your application records a custom integer field to record how many items are in a user's shopping cart:
```sql
SELECT email, avg(toInt64(cart_size))
FROM sessions
GROUP BY 1
ORDER BY 2 DESC
LIMIT 100
```

## Column aliases
If you want your data to be graphed with custom labels, you can alias the appropriate expressions. For example:
```sql
SELECT uniqExact(email) as "User Count" 
FROM sessions
```

## Limitations
Currently, the SQL editor is restricted to a single `SELECT` query - this will be relaxed in the near future to support nested `SELECT` queries, `UNION` queries, and common table expressions.
