---
title: How we built logging as a service with ClickHouse
createdAt: 2023-04-20T12:00:00.000Z
readingTime: 7
authorFirstName: Eric
authorLastName: Thomas
authorTitle: Software Engineer
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/eric-l-m-thomas/'
authorGithub: 'https://github.com/et'
authorWebsite: 'https://elmthomas.com/'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FnGV2kef5QWrrpTb8zSx3&w=3840&q=75
tags: Product Updates
metaTitle: How we built logging as a service with ClickHouse
---

At the end of last year, Highlight released a [_revamped version_](https://www.highlight.io/blog/new-error-management-ui "https://www.highlight.io/blog/new-error-management-ui") of our error monitoring product whereby you could go from stacktrace to session replay to see exactly what the user did to trigger an error. Getting this insight gives developers the cheat code to figuring out how a bug occurred in the first place.

The next natural extension to solving errors was providing all the logs emitted from clicking a button cycling down and up the stack and today we are delighted that logging is available for all Highlight users 🥳

Like most logging applications, we give you the ability to find logs given whatever custom attributes you attach to a log along with auto-injecting valuable debugging information via our SDKs.

Unlike monitoring tools that do one thing or are so disjointed that nothing works together, we go one step further and autolink everything in our product with zero config.

![Cohesion720.gif](https://media.graphassets.com/DJo4A4koTKuKHdhhflf1 "Cohesion720.gif")

What follows is our journey to building a logging product with Clickhouse and all the mistakes we made along the way.

## **Figuring out our schema**

At Highlight, we’ve gone all in on [_OpenTelemetry_](https://www.highlight.io/blog/opentelemetry "https://www.highlight.io/blog/opentelemetry"). A nice artifact of that is that it helps accelerate the design phase since we can lean heavily on what they’ve built and adapt it to our needs. We also knew that we wanted to leverage Clickhouse given [_those_](https://blog.cloudflare.com/log-analytics-using-clickhouse/ "https://blog.cloudflare.com/log-analytics-using-clickhouse/") [_who_](https://www.uber.com/blog/logging/ "https://www.uber.com/blog/logging/") [_have_](https://www.youtube.com/watch?v=CVVp6N8Xeoc "https://www.youtube.com/watch?v=CVVp6N8Xeoc") paved the way before us. Reaching into the internals of OpenTelemetry code, we can see they have a [_design_](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f5275de9a1355c13d85161db6b2eae9d239f1ead/exporter/clickhouseexporter/exporter_logs.go#L135-L156 "https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f5275de9a1355c13d85161db6b2eae9d239f1ead/exporter/clickhouseexporter/exporter_logs.go#L135-L156") if you’re running your own [_collector_](https://opentelemetry.io/docs/collector/ "https://opentelemetry.io/docs/collector/").

```
CREATE TABLE IF NOT EXISTS logs (
      Timestamp DateTime64(9),
      TraceId String,
      SpanId String,
      TraceFlags UInt32,
      SeverityText LowCardinality(String),
      SeverityNumber Int32,
      ServiceName LowCardinality(String),
      Body String,
      ResourceAttributes Map(LowCardinality(String), String),
      LogAttributes Map(LowCardinality(String), String),
      INDEX idx_trace_id TraceId TYPE bloom_filter GRANULARITY 1,
      INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter GRANULARITY 1,
      INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter GRANULARITY 1,
      INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter GRANULARITY 1,
      INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter GRANULARITY 1,
      INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE MergeTree()
      PARTITION BY toDate(Timestamp)
      ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
      TTL Timestamp + toIntervalDay(30)
      SETTINGS ttl_only_drop_parts = 1;
```

This gave us enough of a starting point on design and we modified the schema along the way as we understood our needs more.

## **Adding multi-tenancy**

The above design works if you’re housing your own logs, but we’re building logging as a service. At Highlight, everything is owned by a project. We considered separate tables per project (even separate databases) so one noisy project can’t degrade the experience for everyone else but this [_video_](https://www.youtube.com/watch?v=DP7l6Swkskw&t=3777s "https://www.youtube.com/watch?v=DP7l6Swkskw&t=3777s") convinced us we just needed to add a single column (`ProjectId`).

In Clickhouse, unless explicitly stated, the primary key is derived from the `ORDER BY` clause. Since each of our queries would include this column, we simplified our `ORDER BY` to:

```
ORDER BY (ProjectId, toUnixTimestamp(Timestamp)
```

As long as every query includes a `ProjectId` and `Timestamp` in a `WHERE` clause, Clickhouse can efficiently query our data through the [_primary key_](https://clickhouse.com/docs/en/optimize/sparse-primary-indexes#clickhouse-index-design "https://clickhouse.com/docs/en/optimize/sparse-primary-indexes#clickhouse-index-design").

## **Handling time**

Of all the things to get right with logs, time is the most important.

OpenTelemetry’s schema describes the `Timestamp` as type, `DateTime64(9)`, which implies every time will have nanosecond precision (e.g. `2023-04-12 10:20:30.999999999` ). The decision to use this much precision has some precedence of ensuring logs that come at the exact same second can be ordered properly.

However, once we populated our table with hundreds of millions of logs, we observed that worse case scenario queries are the ones that search over a large time frame even if the result size is small. A simple query to get the most recent 50 logs over the last 30 days:

```
SELECT *
FROM logs
Where ProjectId = 1
AND Timestamp <= now() AND Timestamp >= (now() - toIntervalDay(30))
ORDER BY
  Timestamp DESC
LIMIT 50
```

would throw memory limit errors:

```
"Code: 241. DB::Exception: Memory limit (for user) exceeded: would use 8.00 GiB (attempt to allocate chunk of 4434098 bytes), maximum: 8.00 GiB. OvercommitTracker decision: Query was selected to stop by OvercommitTracker.: Cache info: Buffer path: ch-s3-faf28823-b036-4ef3-b703-750dad5ee0b9/mergetree/yga/qhwalotmlwzbleeyyrlienvykaxpy, hash key: a4c87d31cb1ecdb47bc88ff5cd84fd12, file_offset_of_buffer_end: 430543, internal buffer remaining read range: [430587:430586], read_type: REMOTE_FS_READ_AND_PUT_IN_CACHE, last caller: ef1cdf5e-fba0-470c-a27b-e2b3fa435d20:471, file segment info: None: (while reading column TraceFlags): (while reading from part /var/lib/clickhouse/disks/s3disk/store/48e/48e1599a-61fc-4783-91d0-cea46ab2400f/20230306_94087_95989_1467/ from mark 0 with max_rows_to_read = 3512): While executing MergeTreeReverse. (MEMORY_LIMIT_EXCEEDED) (version 22.13.1.24479 (official build))\\n"
```

That query would use 8 GB of memory to execute 🤯

After some searching on [_GitHub issues_](https://github.com/ClickHouse/ClickHouse/search?q=DateTime64&type=issues "https://github.com/ClickHouse/ClickHouse/search?q=DateTime64&type=issues"), asking the [_Clickhouse Slack community_](https://clickhouse.com/blog/the-click-house-community#:~:text=ClickHouse%20Community%20Slack%20Channel "https://clickhouse.com/blog/the-click-house-community#:~:text=ClickHouse%20Community%20Slack%20Channel"), and becoming adept at [EXPLAIN](https://www.youtube.com/watch?v=hP6G2Nlz_cA "https://www.youtube.com/watch?v=hP6G2Nlz_cA"), we discovered that a lot of performance issues can stem from using too much precision on a timestamp. We reasoned as well that using a `DateTime` (second precision) is just fine from a product perspective.

We created a new table, (aptly named `logs_new` ) with the column `Timetamp DateTime` and backfilled the data from the old table, `logs`:

```
INSERT INTO logs_new
SELECT * from logs;
```

Running the same query takes uses only [_520.34 MB of memory_](https://github.com/highlight/highlight/pull/4667 "https://github.com/highlight/highlight/pull/4667"). As previously stated, searching a large time frame is the worse case scenario — performance improves greatly when the time frame is smaller or when additional filters are added.

## **Pagination and permalinking**

There’s three hard problems in computer science: naming things, cache invalidation, and stable, cursor pagination.

When a user loads the logs page, we return back the most recent 50 logs. As they scroll to the end of the window, we load the next 50 logs _after_ the last log in the first request.

This isn’t this author’s first rodeo with respect to pagination. Inefficient solutions like using `OFFSET` pagination that say “give me the next page” of logs are easy to set up but far less scalable than solutions like cursor pagination that say “give me the next set of logs _after_ this cursor\*”.\* For most databases, the cursor is an auto-incrementing ID (presumably this is in sync with a record’s creation time).

But Clickhouse has no concept of an auto-incrementing IDs and when a record is created it is not a true definition of time in a logging application. A log’s timestamp should be when it was emitted from a customer’s code. Because we use batching techniques under the hood to flush logs periodically, there will be some delay before that log is finally written to our Clickhouse database. To make the problem harder, it’s entirely likely that two logs could share the same timestamp if they are emitted at nearly the same time.

### **Relay to the rescue**

A good forcing function for us was figuring out first what the API would look like. We use GraphQL at Highlight because we love taking advantage of its type safety. [_Relay_](https://relay.dev/ "https://relay.dev/") is an opinionated way of designing your GraphQL API. We’ve never tapped into it prior but they do provide a [_spec_](https://relay.dev/graphql/connections.htm "https://relay.dev/graphql/connections.htm") on structuring pagination responses.

```
{
  logs(after: "opaqueCursor") {
    edges {
      cursor
      node {
        timestamp
        message
        ... // other log data
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

The naming can feel overly verbose for the uninitiated but the takeaway is that if you can achieve the spec, then you’ve solved the problem. Relay uses the intentional naming of `cursor` which is type `String` and not a [_GraphQL ID_](https://graphql.org/learn/schema/#scalar-types "https://graphql.org/learn/schema/#scalar-types"). It’s up to the implementer to decide on how this is defined.

The above code example solves paging forward and it’s a great starting point before trying to complete the full spec of also paging backwards.

### **UUID to the rescue**

Now that we had our spec in place, we needed to fill in the details. For our `cursor`, we wanted something to be unique. Since a log’s timestamp isn’t guaranteed to be unique, we opted to join it with a new column with a generated UUID to handle conflicts when two logs share the same timestamp.

As mentioned before, a `cursor` is a `String` so we used this function to generate one when we are passing a `cursor` to the frontend.

```
func encodeCursor(t time.Time, uuid string) string {
  key := fmt.Sprintf("%s,%s", t.Format(time.RFC3339), uuid)
  return base64.StdEncoding.EncodeToString([]byte(key))
}
```

and this one to decode the `cursor` passed from the frontend to the backend:

```
func decodeCursor(encodedCursor string) (timestamp time.Time, uuid string, err error) {
  byt, err := base64.StdEncoding.DecodeString(encodedCursor)
  if err != nil {
    return
  }

  arrStr := strings.Split(string(byt), ",")
  if len(arrStr) != 2 {
    err = e.New("cursor is invalid")
    return
  }

  timestamp, err = time.Parse(time.RFC3339, arrStr[0])
  if err != nil {
    return
  }
  uuid = arrStr[1]
  return timestamp, uuid, err
}
```

So when the frontend says “give me the next of logs _after_ this cursor”, we can decode the timestamp and UUID and pass it into this `WHERE` clause:

```
WHERE Timestamp <= time
  AND (Timestamp < time OR UUID < uuid)
ORDER BY Timestamp DESC, UUID DESC
```

The `AND` handles when two logs share the same timestamp meaning that making the same request multiple times will result in the same order of results.

### **Further reading**

There’s a lot more to pagination and we encourage readers to see the [_full PR_](https://github.com/highlight/highlight/pull/4319 "https://github.com/highlight/highlight/pull/4319") that goes into more detail if you are doing something similar with Clickhouse and we [_followed up_](https://github.com/highlight/highlight/pull/4417 "https://github.com/highlight/highlight/pull/4417") with handling backwards pagination and permalinking (fun stuff with subselects and unions).

## **Filtering**

Most [_logging_](https://help.sumologic.com/docs/search/search-query-language/ "https://help.sumologic.com/docs/search/search-query-language/") [_apps_](https://docs.splunk.com/Documentation/SplunkCloud/9.0.2303/Search/GetstartedwithSearch "https://docs.splunk.com/Documentation/SplunkCloud/9.0.2303/Search/GetstartedwithSearch") have complex languages where 99% of the functionality is unused. [_Ours_](https://www.highlight.io/docs/general/product-features/logging/log-search "https://www.highlight.io/docs/general/product-features/logging/log-search") is intentionally simple. Given a log such as:

```
logger.info('Hello world', {
  table: 'users',
}),
```

`Hello world` is the log message, `info` is the log level, and `table:custom` is an arbitrary key/value pair.

Searching common fields like the log’s level (e.g. `level:info` ) maps to a top level column in our Clickhouse table:

```
SELECT * FROM logs
WHERE ProjectId = 1
AND Timestamp <= now()
AND Timestamp >= (now() - toIntervalDay(1))
WHERE SeverityText = 'info'
```

Searching custom attributes (e.g.`table:custom`) queries against a Clickhouse [_map column_](https://clickhouse.com/docs/en/sql-reference/data-types/map "https://clickhouse.com/docs/en/sql-reference/data-types/map") which allows for a flexible schema-less storage.

```
SELECT * FROM logs
WHERE ProjectId = 1
AND Timestamp <= now()
AND Timestamp >= (now() - toIntervalDay(1))
WHERE LogAttributes['table'] = 'custom'
```
### **Log message filtering**

Ideally logs are filtered by some type of key/value pair but most people are going to just search for a log’s message (particularly those who have small apps).

We store log messages in a column called `Body` and it has a `tokenbf_v1` [_skip index_](https://clickhouse.com/docs/en/optimize/skipping-indexes "https://clickhouse.com/docs/en/optimize/skipping-indexes") defined as:

```
INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
```

Which means that it stores a string such as “Hello world” as tokens `["Hello", "world"]`. Hence, to effectively use that index, searching against this requires us to split up the string passed in:

```
SELECT * FROM logs
WHERE ProjectId = 1
AND Timestamp <= now()
AND Timestamp >= (now() - toIntervalDay(1))
WHERE hasToken(Body, 'Hello') AND hasToken(Body, 'world')
```

We’ve also noticed performance gains by manually overriding `PREWHERE` for these types of searches. Check out this [_pull request_](https://github.com/highlight/highlight/pull/4725 "https://github.com/highlight/highlight/pull/4725") if you want a deeper dive with `EXPLAIN` .

## **Wiring this up in Go**

Much of this blog post has focused on Clickhouse, but we also wanted to give some attention to how we built this with Go, our language of choice at Highlight. And while we love Go, we do know it can be difficult to sift through the many libraries out there. With that being said, here’s a speed run of how we use Go with Clickhouse along with pull request examples.

### **Connecting to Clickhouse**

Clickhouse provides an [_official client_](https://github.com/ClickHouse/clickhouse-go "https://github.com/ClickHouse/clickhouse-go") for connecting to a Clickhouse database. We recommend this middle ground over low level tooling like[_ch-go_](https://github.com/ClickHouse/ch-go "https://github.com/ClickHouse/ch-go") and high level ORM tooling like [_go-clickhouse_](https://github.com/uptrace/go-clickhouse "https://github.com/uptrace/go-clickhouse") that’ll just get in your way.

[_https://github.com/highlight/highlight/pull/3606_](https://github.com/highlight/highlight/pull/3606 "https://github.com/highlight/highlight/pull/3606")

### **Migrations**

The [_migrate tool_](https://github.com/golang-migrate/migrate "https://github.com/golang-migrate/migrate") has multiple database support (Clickhouse being one of them). Migrations are automatically run when our backend spins up.

[_https://github.com/highlight/highlight/pull/4109_](https://github.com/highlight/highlight/pull/4109 "https://github.com/highlight/highlight/pull/4109")

### **Testing**

We have a dedicated test database for Clickhouse that is spun up in each of our tests

```
func TestMain(m *testing.M) {
  _, err := setupClickhouseTestDB()
  if err != nil {
    panic("Failed to setup clickhouse test database")
  }
  code := m.Run()
  os.Exit(code)
}
```

and each test handles setting up a test client along with cleaning up the data:

```
func setupTest(tb testing.TB) (*Client, func(tb testing.TB)) {
  client, _ := NewClient(TestDatabase)

  return client, func(tb testing.TB) {
    err := client.conn.Exec(context.Background(), "TRUNCATE TABLE logs")
    assert.NoError(tb, err)
  }
}

func TestBatchWriteLogRows(t *testing.T) {
  ctx := context.Background()
  client, teardown := setupTest(t)
  defer teardown(t)

  // some code that uses `ctx` and `client`
}
```

See [logs_test.go](https://github.com/highlight/highlight/blob/main/backend/clickhouse/logs_test.go "https://github.com/highlight/highlight/blob/main/backend/clickhouse/logs_test.go") for all things we found useful to test.

## **Query building**

Much of what we’ve talked about that’s Clickhouse related is just an SQL snippet. In a real application, this is only half the battle. The `WHERE` part of our SQL is going to constantly change given how a user wants to query their logs.

Fortunately, because Clickhouse uses familiar SQL syntax, there are plenty of SQL builders in Go. Initially we went with [_squirrel_](https://github.com/Masterminds/squirrel "https://github.com/Masterminds/squirrel") but ended up pivoting to the aptly named [go-sqlbuilder](https://github.com/huandu/go-sqlbuilder "https://github.com/huandu/go-sqlbuilder") because unlike most SQL builders, it has support for when querying gets more complex (like subqueries) while still ensuring code is safe from SQL injections.

All of our logic for querying (and writing) to Clickhouse can be found in [logs.go](https://github.com/highlight/highlight/blob/main/backend/clickhouse/logs.go "https://github.com/highlight/highlight/blob/main/backend/clickhouse/logs.go").

## **Summary**

In closing, Clickhouse has been a pleasure to work with. Despite no one having any prior knowledge, we were able to pick it up quickly. This is in large part to the great documentation and the Clickhouse community (support team especially). We are already considering using Clickhouse for new feature development and replacing other parts of our stack (namely OpenSearch and InfluxDB).

There’s still a lot more [_tuning_](https://github.com/highlight/highlight/issues?q=is%3Aopen+is%3Aissue+label%3Aperformance+milestone%3A%22%5Bq1%5D+Logging%22 "https://github.com/highlight/highlight/issues?q=is%3Aopen+is%3Aissue+label%3Aperformance+milestone%3A%22%5Bq1%5D+Logging%22") we’d like to do with Clickhouse as we scale out more. If you’d like to learn more about how we use Clickhouse at Highlight, feel free to ask us anything in our [_discord_](https://highlight.io/community "https://highlight.io/community").
