---
title: 'Observability for Your Go ORM: OpenTelemetry Integration with GORM'
createdAt: 2025-02-20T00:25:15.413Z
readingTime: 10
authorFirstName: Chris
authorLastName: Schmitz
authorTitle: 'Software Engineer @ Highlight'
authorTwitter: https://twitter.com/ccschmitz
authorLinkedIn: https://www.linkedin.com/in/ccschmitz
authorGithub: https://github.com/ccschmitz
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FViK27IG7TCe0YDK20tFy&w=3840&q=75
tags: 'OpenTelemetry, Observability'
metaTitle: 'Observability for Your Go ORM: OpenTelemetry Integration with GORM'
---

[GORM](https://gorm.io) is a popular ORM for Go that allows you to interact with databases using Go structs. It's a great way to improve the ergonomics of interacting with your database, but it does come with some tradeoffs.

When you use an ORM, you are abstracting away the details of the actual queries. This can make it difficult to diagnose issues and optimize for performance.

Using OpenTelemetry, we can collect observability data about how our database is performing and help identify and fix issues quickly.

In this blog post, we'll walk through how to integrate OpenTelemetry with GORM to provide traces and metrics for your database.

## Why Observability Matters for Databases

It may not be obvious why observability matters for databases, so let's quickly cover the benefits. We can collect a few types of data about our database:

* Infrastructure metrics (e.g. CPU, memory, disk, etc.)
* Query performance (latency, errors, etc.)
* Resource utilization (connections, threads, etc.)

With these metrics, we can diagnose and optimize for issues like:

* Slow queries
* High error rates
* Connection pool bottlenecks
* Resource contention

The GORM OpenTelemetry plugin streamlines the process of collecting this data.

## How to Integrate OpenTelemetry with GORM

The GORM OpenTelemetry plugin is a great way to integrate OpenTelemetry with GORM. It's easy to install and use, and it provides a lot of useful data about your database.

First, install the plugin:

```bash
go get gorm.io/plugin/opentelemetry/tracing
```

Then, initialize your database and enable the instrumentation:

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
    "gorm.io/plugin/opentelemetry/tracing"
)

// Initialize your database
db, err := gorm.Open(postgres.Open("your-dsn-here"), &gorm.Config{})
if err != nil {
    log.Fatal(err)
}

// Enables the OpenTelemetry instrumentation
db.Use(tracing.NewPlugin())
```

Assuming you already have OpenTelemetry configured, you'll see traces and metrics exported for your database interactions. If you don't have OpenTelemetry configured in your app, consider using the [Highlight Go SDK](https://pkg.go.dev/github.com/highlight/highlight/sdk/highlight-go#section-readme) to set this up quickly.

## How to Use Traces and Metrics to Diagnose and Optimize

Now that we have traces and metrics, how do we use them to diagnose and optimize our database? For our use case, we'll use [Highlight.io](https://highlight.io) to visualize and work with the data.

### Working with Traces

The GORM plugin will emit spans for each database interaction. If the query is part of an existing trace, the span will be connected to that trace. Here is an example of a web request that triggered a database query:

![GORM Trace](/images/blog/observability-in-gorm/gorm-span.png)

Note the attributes added to the span under the `db` key. We get information about the query that can be used to help understand and optimize it. We even get the SQL statement to so we have the exact query to run in a debugging session.

#### Aggregated Traces

Viewing an individual trace is helpful, but it's often useful to see aggregate data for database interactions. Since we have attributes like `duration`, `db.sql.table`, and `db.operation`, we can use these to group and aggregate data.

![GORM Dashboard](/images/blog/observability-in-gorm/gorm-dashboard.png)

Here you can see how dashboards are being used to monitor query counts, duration, and details of individual slow queries.

### Working with Metrics

The OpenTelemetry GORM plugin will also emit metrics for the database. It currently only reports metrics around connections, which can be helpful for diagnosing issues with your connection pool health and capacity.

Note that the plugin does not have access to infrastructure metrics like CPU, memory, etc., which are also important for monitoring the health of your database. Many cloud providers can export these metrics for you. See [Metrics in AWS](/docs/getting-started/server/hosting/aws-metrics) as an example of how to get these metrics for AWS.

## Conclusion

The GORM OpenTelemetry plugin is an easy way to start collecting observability data for your database. It will give you a lot of useful data for finding issues and optimizing your database.

If you're interested in trying it out, check out the [GORM OpenTelemetry plugin documentation](https://gorm.io/plugin/opentelemetry/tracing) for more information, or consider using the [Highlight Go SDK](https://pkg.go.dev/github.com/highlight/highlight/sdk/highlight-go) to get started quickly.
