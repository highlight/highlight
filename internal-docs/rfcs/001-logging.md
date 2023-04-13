# RFC: Logging

* Status: Accepted
* Author: [@et](https://github.com/et)

## Summary

This RFC captures high level how we will build out a logging feature and the underlying technology to support it.

## Motivation

See [PRD: Logging](../prds/001-logging.md).

## Proposed Implementation

Per the [PRD](https://www.notion.so/PRD-Logging-ec3f3e0b81ad40aaaebb79aa2a42ed14), there are four main components of logging we’re trying to capture: Log ingestion, Log viewing, Log filtering, and Log alerting. We’ll break delivering this out into two milestones saving alerting for the second milestone.

Each milestone will have distinct feature with a lead / budd(ies) listed:

**Feature (Lead / Buddy)** 

The lead is responsible for scoping, implementing, and delegating work to their buddy if needed. Rely on your buddy for providing feedback and being a general sound board.  

### Milestone 0

Our biggest unknown with this project is the data storage, Clickhouse. This is largely because of lack of experience. Before bringing in more members of the team, we should build out a proof of concept with functionality we already have.

**Capturing existing logs (Eric / Vadim)**

We already capture `console.*` logs and show them in the session player dev tools:

![Screenshot 2023-01-24 at 10.47.42 AM.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6ee4471d-2614-4303-bed7-352d5412ac6e/Screenshot_2023-01-24_at_10.47.42_AM.png)

Since we are capturing these logs already, we should add an additional code path that writes to a Clickhouse table (schema defined below). We can use the [web based SQL console](https://clickhouse.com/docs/en/get-started/sql-console/creating#running-a-query) of Clickhouse to query our data.

**Deployment (Vadim / Eric)**

- Deploying a production Clickhouse server.
- Documenting (or coding) how to run Clickhouse locally for other developers.

### Milestone 1

**Log ingestion (Vadim / Eric)**

- SDKs - adding support for our SDKs to provide logging hooks
- Transport - defining and implementing the transport layer for logs to be sent from the client to Highlight. This includes minimizing network requests and optimizing payload sizes.
- Processing - once logs are received, how will we process them Kafka in a timely manner.
- Storage - once logs are finally processed, how will they be stored such that they can be queried later.
- Deployment - how will be deploy the above infrastructure for production and developer machines

**Log viewing + filtering (Eric / Chris)**

- Querying - defining and implementing the private graph queries for fetching logs from our data storage. Support the ability to filter logs.
- Frontend - Handle implementing all the frontend components per the design requirements below.

**Design (Julian / Chris)**

- Log viewing
    - Live tail of logs consisting of log lines
    - Log line
        - Collapsed view of log information
        - Uncollapsed view of all log data
        - If applicable, link to session
    - Input box to filter logs
- If applicable, a view inside error instance to see associated logs
- If applicable, a view inside session to see associate logs
- Log alerts

**Customer feedback (Jay / Eric)**

- Figuring out if there are any customers that would willing to beta test our above feature set.

### **Milestone 2**

**Log Alerting (Eric / ???)**

- Given a log filter, add support to save filter as a “log segment”
- Given a log segment, add support to alert when certain criteria is met.

**Design (Julian / Eric)**

- Log segments
- Log alerting

**Pricing (Jay / Vadim / Eric)**

- Defining retention periods
- Defining storage per project and what our pricing looks like

**Monitoring (Eric / Vadim)**

- Define SLOs for logs emitted from the SDKs to being queryable in the UI.

## Data modeling

Traditionally, the [ELK Stack](https://www.elastic.co/what-is/elk-stack) was commonly used as the de-facto way to store logs. However, after talking to customers and reading several case studies, [Clickhouse](https://clickhouse.com/) has proven to be the future leader in solving this problem. We’ll provide the case studies to provide the reasoning:

- [Uber - Fast and Reliable Schema-Agnostic Log Analytics Platform](https://www.uber.com/blog/logging/)
- [Cloudflare - Log analytics using ClickHouse](https://blog.cloudflare.com/log-analytics-using-clickhouse/)

Check out the [features list](https://clickhouse.com/clickhouse) for a quick summary.

### Potential problems

While the case studies above describe in-house solutions to logging, it may not be perfectly applicable for us offering LaaS (Logging as a Service).

**Logging attributes**

When logs are emitted, we should be plucking out key fields that are commonly accessed. Given this log line emitted from my Rails app into Logtail:

![Screenshot 2023-01-24 at 9.49.04 AM.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0f3720d4-9891-4689-a390-87b94b5fa82d/Screenshot_2023-01-24_at_9.49.04_AM.png)

Logtail decided to create these materialized columns:

![Screenshot 2023-01-24 at 9.50.29 AM.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/97a94b32-6bef-47cd-9642-3e3bcc4ec9de/Screenshot_2023-01-24_at_9.50.29_AM.png)

Clickhouse is not a magic bullet that allows you to query anything you shove into it. Similar to OpenSearch, we must define key properties in our schema. Posthog has an excellent [blog post](https://posthog.com/blog/clickhouse-materialized-columns) on Clickhouse materialized columns and provides [their code](https://posthog.com/handbook/engineering/databases/materialized-columns#automatic-materialization) on how they automatically figure out what columns to materialized.

**Multi-tenancy**

In Highlight, everything is stored at the project level. If we store everything into a Clickhouse table called `logs`, is it possible that a single project with a massive number of materialized columns could cause performance issues for everyone else?

We could potentially solve this by creating a separate `logs` table for each project (or even a separate database). This [stackoverflow post](https://stackoverflow.com/questions/70708649/multi-tenancy-in-clickhouse) recommends against that approach.

The Logtail [docs](https://betterstack.com/docs/logs/using-logtail/querying-data-in-logtail/#materialized-columns) state that they enforce a finite number of materialized columns

![Screenshot 2023-01-24 at 10.05.57 AM.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/04572f25-7e0a-43d8-a232-0594ecc2fd50/Screenshot_2023-01-24_at_10.05.57_AM.png)

Hence, I believe we should use a single table but we should do more research (especially digging more into Posthog’s code) to see what a reasonable materialized columns per project limit should be.

**OpenTelemetry (OTEL)**

In terms of actually modeling the data, we want to stay as close to the OpenTelemetry spec for handling logs. They actually have [support](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) for using an exporter that can pipe logs directly into this Clickhouse [logs schema](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter#logs-1). Custom fields like `project_id` , `secure_session_id` or `workspace_id` (user defined) seem to fit into their `LogAttributes` column but per the reasons above and this [hacker news post](https://news.ycombinator.com/item?id=34502504), we definitely need to define these as a regular column or a materialized column.

**Keeping it simple**

With all that being said, we’ll take the [OTEL spec](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter#logs-1) as a guide and ~~strike out~~ what we don’t need and add Highlight things in green.

```sql
CREATE TABLE logs
(
    `Timestamp`      DateTime64(9) CODEC (Delta, ZSTD(1)),
    ~~`TraceId`        String CODEC (ZSTD(1)),~~
    ~~`SpanId`         String CODEC (ZSTD(1)),~~
    ~~`TraceFlags`     UInt32 CODEC (ZSTD(1)),~~
    `SeverityText` LowCardinality(String) CODEC (ZSTD(1)),
    ~~`SeverityNumber` Int32 CODEC (ZSTD(1)),~~
    ~~`ServiceName` LowCardinality(String) CODEC (ZSTD(1)),~~
    `Body`           String CODEC (ZSTD(1)),
    ~~`ResourceAttributes` Map(LowCardinality(String), String) CODEC (ZSTD(1)),~~
    `LogAttributes` Map(LowCardinality(String), String) CODEC (ZSTD(1)),
~~~~    **`ProjectId`       String CODEC (ZSTD(1)),
    `SecureSessionID` Nullable(String) CODE (ZSTD(1)),**
~~~~    ~~INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,~~
    ~~INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,~~
    ~~INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,~~
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
    ENGINE = MergeTree
        PARTITION BY toDate(Timestamp)
        ~~ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)~~
        ORDER BY (ProjectId, toUnixTimestamp(Timestamp)
        TTL toDateTime(Timestamp) + toIntervalDay(3)
        SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

## Success Metrics

We build what we [agreed](https://www.notion.so/PRD-Logging-ec3f3e0b81ad40aaaebb79aa2a42ed14) on from the PRD and we monitor the performance of the product post launch. 

## Drawbacks

Building a logging application is no easy task. Companies exist purely for the sake of just doing logging. Our biggest challenge will likely be scale which will be hard to predict without massive amounts of production data. 

## Alternatives

- OpenSearch
- [Loki](https://grafana.com/oss/loki/)

See this recent Hacker news [post](https://news.ycombinator.com/item?id=34500822) discussing benchmarks.

Additionally, we should absolutely not consider the Clickhouse [JSON data type](https://altinity.com/blog/clickhouse-json-data-type-version-22-6). Most of the examples from the docs are broken and there are several [issues](https://github.com/PostHog/posthog/issues/10506#issuecomment-1365644696) with it that do not make it production ready.

## Open Questions

- How should developers run Clickhouse? Should we use [Clickhouse Cloud](https://clickhouse.com/cloud) or run Clickhouse locally through [Docker](https://clickhouse.com/docs/en/install/#from-docker-image)?

## Rollout + Adoption

See Milestones above.

## Education

*What work needs to be done to educate the team on this change?*

## Tasks

*Document any open action items to move this forward.*