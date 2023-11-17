---
title: Product Philosophy
slug: product-philosophy
---

## Overview

This doc acts as a reference for our product philosophy at highlight.io, or to be more exact, how we think about what we build (not necessarily how we build it). It acts as a way for our team to prioritize work. If you'd like to learn more about our company values, check [this doc](./1_values.md).

Our mission is to support developers (like you) to ship with confidence. We do this by giving you the tools you need to **uncover, resolve, and prevent** issues in your web app.

## Cohesion

![](/images/Cohesion720.gif)

Our product philosophy at highlight.io is centered around the concept of "cohesion", or the idea that we're focused on building a tightly coupled suite of tools that helps developers ship software with confidence.

Prior to working on highlight.io, we all worked at several tech companies of varying sizes, and had first-hand experience trying to stitch together numerous tools to reproduce bugs. It wasn't uncommon that we had to do something like: log into Sentry to see a stacktrace, log into Splunk to query logs, and after investigating with even more tools, give up and log in "as the user" to try and reproduce the issue.

People may think that we're building multiple products (session replay, error monitoring, etc..) but we see it as one. To see this in action, see our [fullstack mapping guide](../../getting-started/2_frontend-backend-mapping.md).

## We build for today's developer.

If you're building software in today's ecosystem, you probably want to JUST focus on building software. We challenge ourselves to build developer tooling that’s simple, straightforward and opinionated, but configurable if you want to customize your setup. highlight.io is built for developers that want to **develop**. Leave the monitoring stuff to us 👍.

## The Vision

With highlight.io, we're changing that by building monitoring software that "wraps" your infrastructure and application, and we do ALL the work to stitch everything together. Our long-term goal is that you can trace everything from a button click to a server-side regression with little to no effort.

Now, if you were to ask, "but that's a lot to build, no?" we would reply with ["Yes, give us a hand?"](https://careers.highlight.io).

---
title: Documentation
slug: docs
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Getting Started

The documentation rendered on https://highlight.io/docs is rendered from the [docs-content](https://github.com/highlight/highlight/tree/main/docs-content) directory. See the [landing site contributing docs](./4_landing-site.md) for more info.

---
title: Application Architecture
slug: architecture
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

Here's the high level structure of the code that you'll want to start tinkering with.

- SDKs `sdk/`

  - Firstload

  - Client

  - highlight-node / other SDKs

- Public Graph `backend/public-graph/graph/schema.resolvers.go` SDK data ingest GraphQL endpoint, hosted locally at https://localhost:8082/public

- Private Graph `backend/private-graph/graph/schema.resolvers.go` GraphQL endpoint for frontend, hosted locally at https://localhost:8082/private

- Workers `backend/worker.go`

  - Public graph worker `processPublicWorkerMessage`

  - Async worker `Start`

## General Architecture Diagram

![](/images/architecture.png)

## Code Structure Diagram

![](/images/software-components.png)

## Kafka Diagram

![](/images/kafka.png)

## InfluxDB Diagram

![](/images/influx.png)

## OpenTelemetry Diagram

![](/images/opentelemetry.png)

---
title: Code Style
slug: code-style
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

# Code Style

Our main priority is to keep our code to be easy to read and add to. We've codified and automated all style preferences as part of CI and development workflows (such as `husky`) so that there is one consistent source of truth. If you have ideas on how to improve our style linting, open a PR and let us know!

# License

Highlight is [Apache 2](https://github.com/highlight/highlight/blob/main/LICENSE) licensed.

By contributing to Highlight, you agree that your contributions will be licensed under its Apache 2 license.

---
title: Good First Issues
slug: good-first-issues
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## First issues to take on

It's best to start with issues marked as ["good first issue"](https://github.com/highlight/highlight/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). We mark these issues based on how well-defined and testable they are. If you're interested in a larger project, adding support for new programming languages via a new SDK would always greatly appreciated. If there is a feature you're missing in Highlight, reach out on our [discussions](https://github.com/highlight/highlight/discussions) or on our [discord](https://highlight.io/community) to get a conversation started about the best implementation.

---
title: Adding an SDK
slug: adding-an-sdk
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

The highlight.io SDKs are powered by [OpenTelemetry](https://opentelemetry.io/) under the hood, and therefore report data to our deployed OpenTelemetry [collector](https://otel.highlight.io). For a better understanding of the architecture, take a look at the [architecture page](architecture.md) for a diagram of how data is sent to the collector and the public graph.

In our SDKs, we instantiate the following constructs to exports data over OTLP HTTPS to https://otel.highlight.io:4318/v1/traces and https://otel.highlight.io:4318/v1/logs respectively.

- TracerProvider - sets the global otel sdk configuration for traces
- BatchSpanProcessor - batches traces so they are exported in sets
- OTLPSpanExporter - exports traces to our collector over OTLP HTTPS

- LoggerProvider - sets the global otel sdk configuration for logs
- BatchLogRecordProcessor - batches logs so they are exported in sets
- OTLPLogExporter - exports logs to our collector over OTLP HTTPS

The SDK provides common methods for recording exceptions or logging, but this may depend on the language. For example, in Go, a logger hook API is provided to be configured by the application, but in Python, we automatically ingest a hook into the built in `logging` package.

## Recording an Error

Data we send over the OpenTelemetry specification is as a [Trace](https://opentelemetry.io/docs/reference/specification/trace/) with attributes set per the [semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/).
When we create a Trace, we set three additional SpanAttributes to carry the Highlight context:

- highlight.project_id - Highlight Project ID provided to the SDK

- highlight.session_id - Session ID provided as part of the `X-Highlight-Request` header on the network request

- highlight.trace_id - Request ID provided as part of the `X-Highlight-Request` header on the network request

### Reporting an Error as an OTEL Trace

An exception is represented in OpenTelemetry as a Trace Event, per the [semantic convention for exceptions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/exceptions/).

Many OpenTelemetry SDK implementations offer a `span.record_exception(exc)` method that automatically populates the semantic convention attributes with the correct values.

```python

# create a trace for the current invocation
with self.tracer.start_as_current_span("my-span-name") as span:
    span.set_attributes({"highlight.project_id": _project_id})
    span.set_attributes({"highlight.session_id": session_id})
    span.set_attributes({"highlight.trace_id": request_id})
    try:
        # contextmanager yields execution to the code using the contextmanager
        yield
    except Exception as e:
        # if an exception is raised, record it on the current span
        span.record_exception(e)
        raise

```

### Reporting a Log as an OTEL Trace

If a language's OpenTelemetry SDK does not support sending logs natively, we choose to send the message data as a Trace [Event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events).

- Event name - `log`

- `log.severity` event attribute - the log severity level string

- `log.message` event attribute - the log message payload.

To associate the highlight context with a log, we use the [LogRecord](https://opentelemetry.io/docs/reference/specification/logs/data-model/#log-and-event-record-definition) [Attributes](https://opentelemetry.io/docs/reference/specification/logs/semantic_conventions/) with the following convention:

- highlight.project_id - Highlight Project ID provided to the SDK

- highlight.session_id - Session ID provided as part of the `X-Highlight-Request` header on the network request

- highlight.trace_id - Request ID provided as part of the `X-Highlight-Request` header on the network request

```go

package main

import "github.com/highlight/highlight/sdk/highlight-go"

func RecordLog(log string) {
	span, _ := highlight.StartTrace(context.TODO(), "highlight-go/logrus")
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		LogSeverityKey.String("ERROR"),
		LogMessageKey.String(entry.Message),
	}
	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...))
}

```

## Recording a Log

If an SDK supports the experimental logs ingest endpoint (v1/logs), prefer using that. Otherwise, see above for reporting the log as a trace event.

A LogRecord is exported with an associated trace. Specific attributes for the file logging, line number, and more are set based on the [logging semantic convention keys](https://opentelemetry.io/docs/reference/specification/logs/semantic_conventions/).

Here's an example of the interception of python `logging` calls in our [Python SDK](https://github.com/highlight/highlight/blob/93bfea864440a1976ac945ba2b40a34cf3b53479/sdk/highlight-py/highlight_io/sdk.py#L139-L160) to emit an OpenTelemetry LogRecord.

```python

attributes = span.attributes.copy()
attributes["code.function"] = record.funcName
attributes["code.namespace"] = record.module
attributes["code.filepath"] = record.pathname
attributes["code.lineno"] = record.lineno
r = LogRecord(
    timestamp=int(record.created * 1000.0 * 1000.0 * 1000.0),
    trace_id=ctx.trace_id,
    span_id=ctx.span_id,
    trace_flags=ctx.trace_flags,
    severity_text=record.levelname,
    severity_number=std_to_otel(record.levelno),
    body=record.getMessage(),
    resource=span.resource,
    attributes=attributes,
)

```

---
title: Overview
heading: Contributing Overview
slug: getting-started
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## How do I spin up highlight.io locally?

<DocsCardGroup>
    <DocsCard title="Local Development Guide." href="../../../../getting-started/self-host/dev-deployment-guide.md">
        {"Running a docker version of highlight.io for development."}
    </DocsCard>
    <DocsCard title="GitHub Code Spaces Guide" href="./code-spaces.md">
        {"Running highlight.io in a Code Spaces environment."}
    </DocsCard>
</DocsCardGroup>

## What is the app architecture?

<DocsCardGroup>
    <DocsCard title="App Architecture" href="./architecture">
        {"Overall architecture guide."}
    </DocsCard>
    <DocsCard title="SDK Design" href="./adding-an-sdk">
        {"Adding an SDK."}
    </DocsCard>
</DocsCardGroup>


## How do I develop in ...?

<DocsCardGroup>
    <DocsCard title="Frontend" href="./frontend">
        {"Frontend React.js development for app.highlight.io."}
    </DocsCard>
    <DocsCard title="Backend" href="./backend">
        {"Backend GraphQL development for app.highlight.io."}
    </DocsCard>
    <DocsCard title="Landing Site" href="./landing-site">
        {"Frontend Next.js development for highlight.io landing site."}
    </DocsCard>
    <DocsCard title="Docs" href="./docs">
        {"Frontend Next.js development for highlight.io/docs"}
    </DocsCard>
</DocsCardGroup>

## What are development best practices?

<DocsCardGroup>
    <DocsCard title="Good First Issues" href="./good-first-issues">
        {"Good first issues to start with."}
    </DocsCard>
    <DocsCard title="Code Style" href="./code-style">
        {"Defining our code styles."}
    </DocsCard>
</DocsCardGroup>

---
title: Contributing
slug: oss-contributing
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---
---
title: Landing Site (highlight.io)
slug: landing-site
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Getting Started

The documentation rendered on https://highlight.io/docs is rendered from the [docs-content](https://github.com/highlight/highlight/tree/main/docs-content) directory. The code for rendering the landing page resides in [highlight.io](https://github.com/highlight/highlight/tree/main/highlight.io) directory.

To run the app locally, install dependencies and call `yarn dev` as follows:

```bash
yarn install;
yarn dev:highlight.io;
open http://localhost:4000/
```

Changes to `docs-content` may require refreshing the browser.

## Frequently Asked Questions

### How do I test the blog locally?

Blog posts rely on Hygraph for rendering and use an environment variable. Reach our on our [discord](http://highlight.io/community) if you need to work on the blog.

---
title: GitHub Code Spaces
slug: code-spaces
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Running on GitHub Codepsaces (in browser or in VS Code)

-   Make sure you've forked the repo
-   Visit https://github.com/codespaces and start a codepsace for highlight/highlight
-   Install the VS Code Extension "GitHub Codespaces"
-   Using VS Code, enter codespace - `CMD + Shift + P`, type `codespace`, select the Highlight codespace
-   If docker is not running (try `docker ps`), run a full rebuild: press `CMD + Shift + P`, select `Codespaces: Full Rebuild Container`

```bash
# from highlight/
cd docker
./run.sh
# View `https://localhost:3000`
```

---
title: Frontend (app.highlight.io)
slug: frontend
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Frequently Asked Questions

### How do I change the Apollo Client GraphQL definitions?

The frontend is set up to host the Apollo Client definitions in [frontend/src/graph/operators](https://github.com/highlight/highlight/tree/main/frontend/src/graph/operators). Query definitions reside in [query.gql](https://github.com/highlight/highlight/blob/main/frontend/src/graph/operators/query.gql#L4) while mutation definitions reside in [mutation.gql](https://github.com/highlight/highlight/blob/main/frontend/src/graph/operators/mutation.gql).

Changing these two files regenerates frontend hooks and other Typescript definitions. Having the frontend running will watch these two files for changes and update generated code. See [the development docs](../../../../getting-started/self-host/dev-deployment-guide.md) for more info on running the frontend.

---
title: GraphQL Backend
slug: backend
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Frequently Asked Questions

### How do I migrate schema changes to PostgreSQL?
Schema changes to [model.go](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L1) will be automigrated. New tables should be added to [Models](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L133-L187). [Migrations happen automatically](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L1268) in dev and in a GitHub action as part of our production deploy. 

### How do I inspect the PostgreSQL database?
```bash
cd docker;
docker compose exec postgres psql -h localhost -U postgres postgres;
```
will put you in a postgresql cli connected to your local postgres docker container.
Run commands such as `\d` to list all tables, `\d projects` to describe the schema of a
table (i.e. projects), or `show * from sessions` to look at data (i.e. rows in the sessions table).

### How to generate the GraphQL server definitions?
Per the [Makefile](https://github.com/highlight/highlight/blob/main/backend/Makefile), `cd backend; make private-gen` for changes to [private schema.graphqls](https://github.com/highlight/highlight/blob/main/backend/private-graph/graph/schema.graphqls) and `cd backend; make public-gen` for changes to [public schema.graphqls](https://github.com/highlight/highlight/blob/main/backend/public-graph/graph/schema.graphqls#L4). The commands can also be executed inside docker:

```bash
cd backend;
make private-gen;
make public-gen;
```

---
title: Open Source
slug: open-source
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

---
title: Self-hosted [Enterprise]
slug: self-host-enterprise
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## Our Enterprise Self-hosted Deployment

Interested in deploying Highlight to your own VPC at a larger scale than the [hobby deployment](3_self-host-enterprise.md)? Please contact us in our [discord community](https://community.highlight.io) to get in touch.

## Pricing

Pricing for our self-hosted enterprise deployment starts at $3k / month. Contact us at jay@highlight.io, or message us [on discord](https://community.highlight.io) to get in touch.

---
title: Self-hosted [Hobby]
slug: self-host-enterprise
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## Our Hobby Self-hosted Deployment

Interested in deploying highlight.io on your local machine or on a small remote instance? You're in the right place. Here's a walkthrough on getting this set up:

<DocsCardGroup>
    <DocsCard title="Hobby Deployment Guide" href="../../../../getting-started/self-host/self-hosted-hobby-guide.md">
        {"Getting started with our hobby deployment."}
    </DocsCard>
</DocsCardGroup>

# Limitations

We don't recommend hosting Highlight yourself if you have more than 10k monthly sessions or 50k monthly errors. The infrastructure configuration in the docker compose is not meant to scale beyond a small number of sessions, and isn't resilient to an outage or version upgrades.

That being said, if the benefits of self hosting Highlight are signficant enough, you may want to consider an enterprise deployment (see [our Enterprise Self Hosted Docs](3_self-host-enterprise.md)).

If you have any questions, don't hesitate to [reach out](https://community.highlight.io)!

---
title: Self-hosting
slug: Self-hosting
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

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

| Name             | Description           | Type   |
|------------------|-----------------------|--------|
| num-cpu          | CPU Count             | int    |
| mem-used-percent | Percent memory used   | float  |
| mem-total        | Bytes of memory total | int    |

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

## General Telemetry

| Name                     | Description                                        | Type   |
|--------------------------|----------------------------------------------------|--------|
| version                  | Highlight version sha                              | string |
| is-onprem                | Value of env var ON_PREM                           | string |
| doppler-config           | When doppler is used, the name of the environment. | string |
| phone-home-deployment-id | A randomly-generated deployment identifier.        | string |

---
title: Self-hosted [Dev]
slug: self-host-enterprise
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## Our Development Deployment

Interested in deploying highlight.io on your local machine for developing in the Highlight codebase?

<DocsCardGroup>
    <DocsCard title="Development Deployment Guide" href="../../../../getting-started/self-host/dev-deployment-guide.md">
        {"Getting started with our developer deployment."}
    </DocsCard>
</DocsCardGroup>

If you have any questions, don't hesitate to [reach out](https://community.highlight.io)!

---
title: Compliance & Security
slug: compliance-and-security
createdAt: 2021-09-14T02:03:51.000Z
updatedAt: 2022-09-08T21:45:54.000Z
---

## Security Certifications

We take compliance and security very seriously at [highlight.io](https://highlight.io). We officially have a SOC 2 Type2 report, GDPR compliance and are currently in the process of attaining HIPAA. 

![](/images/certs.png)

## Requesting information

If you're evaluating highlight.io at your company and want to request documentation of any of our certifications, request a DPA, or have questions on the security end, please shoot us an email at [security@highlight.io](mailto:security@highlight.io).

## Subprocessors

Below is a list of our subprocessors:

| Subprocessor              | Processing Usage            | Country of location |
|---------------------------|-----------------------------|---------------------|
| Amazon Web Services (AWS) | Data hosting and processing | USA                 |
| Google                    | Data Storage                | USA                 |
| Mixpanel                  | Analytics                   | USA                 |
| Hubspot                   | CRM, Marketing Automation   | USA                 |
| Intercom                  | Support Services            | USA                 |
| Sendgrid                  | Email Delivery              | USA                 |
| Datadog                   | Metrics                     | USA                 |
| Stripe                    | Payment Processing          | USA                 |
| Clickhouse                | Data storage                | USA                 |

## Avoiding Cookie Consent (disabling localStorage)

If you're using the highlight.io browser client and would like to avoid requesting cookie consent from your users,
you can pass the `storageMode: 'sessionStorage'` option to `H.init` to make sure that highlight will not persist
any data in `window.localStorage`. This will mean that if a user leaves your site and returns later, a new
highlight recording will start regardless of the time since they left, 
since we will not persist any metadata in the browser.

---
title: Company
slug: company
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

---
title: Values
slug: values
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

## Overview

This doc acts as a reference for our values at highlight.io, which includes how we work and we build things. It acts a way for us to understand how we should operate and what the "startup mentality" means to us. If you'd like to learn more about our product philosophy (which is more related to our product) see [this doc](./product-philosophy.md).

## We build in public.

With everything we build, we maintain an unwavering promise to use open source technologies so that you and your team don't have a dependency on our hosted offerings. 

We strive to build in public in every way we can. This means sharing our roadmap, product specs, and company strategy. We see this as giving you all the more reason to consider joining us in [building highlight](https://careers.highlight.run).


## We execute quickly and fail fast.

Given that most of the things we build are zero to one, there's often no better way to learn than to build. It's hard to predict how something will scale or be interacted w/ without building something and getting early feedback. With this philosophy, however, it's easy to ship low quality work. To address this, we always prefer to "cut scope, not quality"; we build out a few, very polished modules rather than many half-baked ones.

## ABC: Always be chilling....

Though working at highlight.io can be fast-paced at times, we keep it chill. This means aking time for social events, taking time off, and learning about each other beyond just work. We're all humans, and we all have lives outside of work.

![](/images/ohyeah.gif)

---
title: Our Competitors
slug: competitors
createdAt: 2021-09-14T02:03:51.000Z
updatedAt: 2022-09-08T21:45:54.000Z
---

We respect our competitors. In fact, we're not in the business of trying to convince people to use our product when it's not the right fit for them. Explore details about some of our competitors below.

## Session Replay Competitors

<DocsCardGroup>
    <DocsCard title="LogRocket" href="https://highlight.io/compare/highlight-vs-logrocket">
        {"Learn more about how we compare to LogRocket."}
    </DocsCard>
    <DocsCard title="Hotjar" href="https://highlight.io/compare/highlight-vs-hotjar">
        {"Learn more about how we compare to Hotjar."}
    </DocsCard>
    <DocsCard title="Fullstory" href="https://highlight.io/compare/highlight-vs-fullstory">
        {"Learn more about how we compare to Fullstory."}
    </DocsCard>
    <DocsCard title="Smartlook" href="https://highlight.io/compare/highlight-vs-smartlook">
        {"Learn more about how we compare to Smartlook."}
    </DocsCard>
    <DocsCard title="Inspectlet" href="https://highlight.io/compare/highlight-vs-inspectlet">
        {"Learn more about how we compare to Inspectlet."}
    </DocsCard>
    <DocsCard title="Datadog" href="https://highlight.io/compare/highlight-vs-datadog">
        {"Learn more about how we compare to Datadog."}
    </DocsCard>
    <DocsCard title="Sentry" href="https://highlight.io/compare/highlight-vs-sentry">
        {"Learn more about how we compare to Sentry."}
    </DocsCard>
</DocsCardGroup>

## Error Monitoring Competitors

<DocsCardGroup>
    <DocsCard title="Datadog" href="https://highlight.io/compare/highlight-vs-datadog">
        {"Learn more about how we compare to Datadog."}
    </DocsCard>
    <DocsCard title="Sentry" href="https://highlight.io/compare/highlight-vs-sentry">
        {"Learn more about how we compare to Sentry."}
    </DocsCard>
</DocsCardGroup>

## Logging Competitors

<DocsCardGroup>
    <DocsCard title="Datadog" href="https://highlight.io/compare/highlight-vs-datadog">
        {"Learn more about how we compare to Datadog."}
    </DocsCard>
</DocsCardGroup>

---
title: Environments
slug: environments
createdAt: 2021-09-14T17:42:37.000Z
updatedAt: 2022-03-09T17:00:11.000Z
---

Environments can be assigned to sessions and errors by setting the environment option in [H.init()](../../../sdk/client.md#Hinit). With the assignment, you can know search and filter sessions and errors based on the environment they come from.

Environments are also used to determine whether [Alerts](../3_general-features/alerts.md) are created.

## Example

```typescript
H.init('<YOUR_PROJECT_ID>', {
  environment: process.env.ENVIRONMENT,
})
```

---
title: Digests
slug: digests
createdAt: 2022-12-12T00:00:00.000Z
updatedAt: 2022-12-12T00:00:00.000Z
---

Highlight digests are weekly email summaries of interesting sessions, errors, and user activity. Highlight sends two separate digests each week:
- **Project Overview** summarizes aggregate user activity and lists the top errors and sessions for the week
- **Session Insights** is a spotlight on the most interesting sessions

## Getting Started

You don't have to do anything to start receiving digests. If your project has 50+ sessions recorded in the past week, a digest for that week will automatically be emailed to all workspace members. To enable AI summaries in the Session Insights digest, you can opt in [here](https://app.highlight.io/w/harold-ai).

## Project Overview features
The Project Overview digest contains multiple sections to showcase aggregate user activity, plus sessions and errors ordered by certain metrics.

### User activity

This section shows aggregate user activity stats for last week and the change from the prior week. This includes total users (the count of unique users), total sessions, total errors, and average time spent (average active time per session).

![](/images/user_activity.png)

### Active sessions

This section shows the top 5 sessions ordered by active time.

![](/images/active_sessions.png)

### Erroneous sessions

This section shows the top 5 sessions ordered by error count.

![](/images/error_sessions.png)

### New errors

This section shows the top 5 errors originating in the last week, ordered by the count of unique affected users.

![](/images/new_errors.png)

### Frequent errors

This section shows the top 5 errors ordered by their frequency. Ignored errors are excluded.

![](/images/frequent_errors.png)

## Session Insights features

The Sessions Insights digest lists the top 3 most interesting sessions for the week. These sessions are chosen by looking at the user journey in each session, and calculating which journeys are the least likely. These sessions tend to show users who may be frustrated or are using the app in unexpected ways.

### AI summaries

AI summaries can be included in the Sessions Insights digest to describe what events happen in a session, so that you can tell at a glance what makes the session interesting and what it will contain.
To enable AI summaries, you can opt in [here](https://app.highlight.io/w/harold-ai).

![](/images/ai_summaries.png)

---
title: Comments
slug: comments
createdAt: 2021-09-14T00:13:59.000Z
updatedAt: 2022-04-13T00:10:08.000Z
---

Comments can be made by you or anyone on your team on sessions and errors.

## Session Comments

Session comments can be made by clicking anywhere on the session replay. Session comments are special because they connect a comment to a position on the screen and the current time. This is extremely powerful because now when you create a comment, you don't have to write more to provide the location/time context.

### Notifications

If you tag your team when creating a comment (learn more [Slack Integration](../../7_integrations/slack-integration.md)), Highlight will send them a message via email or Slack. Those messages will contain your comment text and a screenshot of the session at the current time.

![](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/gsYvSrZkPZwf-M-P75jKp_brandbird-1.png)

## Collaboration

You can tag a teammate in a comment by typing `@` and then picking your teammate. When you tag a teammate, they will receive a notification with the message you wrote.

### Replies

Want to have a conversation relevant to what you're looking at? You can also reply to Session or Error comments on the side panel or directly via the popup.

![](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/W0rMORhS-yYiCNY__ZCRA_image.png)

When participating in a comment, you become subscribed to future replies. Subsequent replies will notify you via Slack (learn more [Slack Integration](../../7_integrations/slack-integration.md)) or email. Any Slack channel or user tagged is also automatically subscribed.

### Slack Integration

You can tag Slack users or channels in comments after connecting Highlight with Slack (learn more [Slack Integration](../../7_integrations/slack-integration.md)). When you tag a Slack user or channel, Highlight will send them a message with your comment and a link to where the comment was made.

### Linear Integration

You can create issues in Linear as you add comments. Within a comment, select "Create a Linear issue" from the issues dropdown. On the next page, you'll be prompted to optionally edit the issue title and description. Once you save the comment, an issue is created and linked to in Linear.

---
title: Webhooks
slug: webhooks
createdAt: 2021-09-14T00:14:56.000Z
updatedAt: 2021-09-14T19:03:52.000Z
---

All alerts can route notifications to webhooks via a HTTP POST JSON payload. For example, if you are hosting an HTTP webserver listening on `https://example.com/api/webhook`, you can [configure alerts on Highlight](https://app.highlight.io/alerts).

To add an outgoing webhook destination, edit an [alert](https://app.highlight.io/alerts) and set the destination URL.

![](/images/webhook.png)

Here's an example of a payload that is sent.

```json
{
  "Event": "ERROR_ALERT",
  "ErrorCount": 1,
  "ErrorTitle": "Oh no! An error occurred",
  "SessionURL": "https://app.highlight.io/1/sessions/",
  "ErrorURL": "https://app.highlight.io/1/errors/sqavrqpCyrkOdDoYjMF7iM0Md2WT/instances/11493",
  "UserIdentifier": "vadim@highlight.io",
  "VisitedURL": "https://app.highlight.io/1/alerts"
}
```

Session alerts, user alerts, and metric monitors can all send webhook notifications. The payload resembles a similar format for all notification types.

If you are interested in customizing the payload or authenticating the webhook request with an authorization header, follow this [issue on GitHub](https://github.com/highlight/highlight/issues/4697) for updates.

<RoadmapItem title="Webhook Payload Customization & Authentication" number="4697" link="https://github.com/highlight/highlight/issues/4697" linkText="Outgoing Webhook Enhancements" />

---
title: General Features
slug: general-features
createdAt: 2021-09-13T23:56:14.000Z
updatedAt: 2022-08-03T19:08:25.000Z
---

---
title: Alerts
slug: alerts
createdAt: 2021-09-14T00:14:56.000Z
updatedAt: 2021-09-14T19:03:52.000Z
---

Alerts are a way to keep your team in the loop as to what is happening on your app. Below is a description of the common components of Alerts, and more specific parameters are included in subsequent sections. To get started, visit [app.highlight.io/alerts](https://app.highlight.io/alerts). The basic parameters for an alert look like the following image:

![](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/NqoXlpImTuC1Hc_41ekn5_5d8b382-alerts-basic.png)

## Connecting a Slack Channel

If you haven't already integrated Highlight with Slack, clicking the "Channels To Notify" dropdown will prompt you to select a channel. Once this is done, you can add any number of channels to be pinged when an alert is thrown.

## Excluding Environments

You may want to exclude certain environments from generating alerts. For example, in your team's dev environment, it's unlikely that you want to be notified of every error. You can do this by adding an excluded environment option.

Learn more about [Environments](../3_general-features/environments.md).

## Webhook Notifications

All alerts can route notifications to webhooks via a HTTP POST JSON payload. Learn more about [configuring webhooks](./webhooks.md).

---
title: Services
slug: services
createdAt: 2023-09-18T18:05:43.021Z
updatedAt: 2023-09-18T18:05:43.021Z
---

Services are a useful tool to delineate your logs, errors, and traces. In order to create a new service, a service name must be provided to your SDK configuration.
Reference the [SDK start up guides](../../../getting-started/1_overview.md) for more help.

For example, in Golang, the following SDK will create a new service named "my-app":
```
highlight.SetProjectID("<YOUR_PROJECT_ID>")
highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
)
defer highlight.Stop()
```

Created services are visible at https://app.highlight.io/settings/services.

![Service's page](/images/features/services.png)
---
title: Segments
slug: segments
createdAt: 2021-09-14T01:48:14.000Z
updatedAt: 2021-09-14T18:55:12.000Z
---

Segments are a set of search filters that apply to sessions or errors. Segments are useful if you want to quickly view sessions or errors that relate to a certain population of your users.

Highlight supports a variety of filters. Visit [app.highlight.io/demo](https://app.highlight.io/demo/sessions) to experiment with real Highlight data.

![segment filters](/images/features/segment-filters-sq.png)
---
title: Overview
heading: General Features
slug: overview
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Below are several highlight.io features that might be worth taking a look at.

<DocsCardGroup>
    <DocsCard title="Alerts."  href="./alerts.md">
        {"Get alerts for sessions, errors, new users and more!"}
    </DocsCard>
    <DocsCard title="Comments."  href="./comments.md">
        {"Collaborate on bugs throughout your web app."}
    </DocsCard>
    <DocsCard title="Digests."  href="./digests.md">
        {"Get a weekly digest of sessions that are worth watching."}
    </DocsCard>
    <DocsCard title="Environments."  href="./environments.md">
        {"Version resources so that you know what environment events happened in."}
    </DocsCard>
    <DocsCard title="Segments."  href="./segments.md">
        {"Create search filters so searching for sessions & errors is easy!"}
    </DocsCard>
    <DocsCard title="Services."  href="./services.md">
        {"Create services to better group your errors, logs, and traces."}
    </DocsCard>
</DocsCardGroup>

---
heading: Log Search Specification
title: Log Search
slug: log-search
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Logs are broken down into two discrete concepts: messages and attributes. Given the following log:

```
logger.info('Queried table', {
  table: 'users',
  query: 'hello',
}),
```

The log message is `Queried table` and the attributes are `table:users` and `query:hello`.

## Searching for logs

### Messages search

To search for a log message, simply type the text of the message. Given the following log:

```
log.info("excluding session due to no user interaction events")
```

We can find this log by typing `excluding session due to no user interaction events`

![](/images/log-search.png)

### Attributes search

To search on a log attribute, add a `:` between search terms. Given the following log:

```
log.info({
  user_id: 42,
})
```

We can search for it via:

- `user_id:42` matches every log where `user_id` is `42`
- `level:info` matches every log where `level` is `info`

We can exclude logs that match an attribute by prefixing it with `-`:

- `user_id:-42` matches every log where `user_id` _is not_ `42`
- `level:-info` matches every log where `level` _is not_ `info`

#### AND vs OR

When multiple attributes are included, they work as an `AND` operator:

- `user_id:42 level:info` - matches every log where `user_id` is `42` _and_ `level` is `info`

When the same attribute is included twice in a search, it works as an `OR` operator:

- `user_id:42 level:info level:warn` - matches every log where `user_id` is `42` _and_ (`level` is `info` _or_ `level` is `warn`)

### Wildcard search

To perform a wildcard search, use the `*` symbol:

- `service:frontend*` matches every log that has a service starting with `frontend`
- `frontend*` matches all log messages starting with the word `frontend`
- `*frontend` matches all log messages ending with the word `frontend`

## Autoinjected attributes

By default, Highlight's SDKs will autoinject attributes to provide additional context as well as assisting in linking [sessions](../1_session-replay/) and [errors](../2_error-monitoring/) to their respective logs.

| Attribute        | Description                                        | Example                                                                                                                                             |
|------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `code.filepath`  | File path emitting the log.                        | `/build/backend/worker/worker.go`                                                                                                                   |
| `code.function`  | Function emitting the log.                         | `github.com/highlight-run/highlight/backend/worker.(*Worker).Start.func3`                                                                           |
| `code.lineno`    | Line number of the file where the log was emitted. | `20`                                                                                                                                                |
| `host.name`      | Hostname                                           | `ip-172-31-5-211.us-east-2.compute.internal`                                                                                                        |
| `os.description` | Description of the operating system                | `Alpine Linux 3.17.2 (Linux ip-172-31-5-211.us-east-2.compute.internal 5.10.167-147.601.amzn2.aarch64 #1 SMP Tue Feb 14 21:50:23 UTC 2023 aarch64)` |
| `os.type`        | Type of operating system                           | `linux`                                                                                                                                             |
| `level`          | The log level                                      | `info`                                                                                                                                              |
| `message`        | The log message                                    | `public-graph graphql request failed`                                                                                                               |
| `span.id`        | Span id that contains this log                     | `528a54addf6f91cc`                                                                                                                                  |

---
title: Logging
slug: logging
createdAt: 2021-09-14T01:47:59.000Z
updatedAt: 2022-01-07T23:15:15.000Z
---

---
heading: Log Alerts
title: Log Alerts
slug: log-alerts
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Logs alerts are a way to get notified when the count of logs for a query is over or under a threshold for a specific time range.

## Creating an alert

[](/images/log-alert.png)

### Query

When you set up an alert, you can include a query to count only the logs that match. The query format follows the same specification as on the logs page. You can read more [here](./log-search.md).

### Alert Threshold

You can control the number of logs needed to trigger an alert by setting an alert threshold. You can choose to alert if the actual log count is above or below this threshold.

### Alert Frequency

You can adjust the time range for which logs are searched and aggregated. Shorter frequencies can be helpful to be alerted quickly about an issue, while longer frequencies can help reduce noise by aggregating across a larger time range.

### Notifications

Log alerts can be configured to notify you via Slack, Discord, email, or webhooks. For more details, see [alerts](../3_general-features/alerts.md).

---
heading: Logging Features
title: Overview
slug: overview
---

You can find our logging product at [app.highlight.io/logs](https://app.highlight.io/logs). 

If your language of choice isn't support in the "Getting Started" docs below, hit us up in [our community](https://highlight.io/community) or send us an email at support@highlight.io

Get started with the resources below:

<DocsCardGroup>
    <DocsCard title="Get Started" href="../../../getting-started/1_overview.md#for-your-backend-logging">
        {"Set up logging for your application."}
    </DocsCard>
    <DocsCard title="Log Search Specification" href="./log-search.md">
        {"The specification we use for ingesting and searching for logs."}
    </DocsCard>
    <DocsCard title="Log Alerts" href="./log-alerts.md">
        {"Set up alerts to be notified when logs exceed a threshold."}
    </DocsCard>
</DocsCardGroup>

---
title: Enhancing Errors with GitHub
slug: enhancing-errors-with-github
createdAt: 2023-09-07T16:07:50.273Z
updatedAt: 2023-09-07T16:07:50.273Z
---

Highlight has the capability to enhance your backend errors using GitHub (errors on the frontend are enhanced using [sourcemaps](./sourcemaps.md)). With our GitHub
integration, Highlight is able to enhance a stacktrace with context, as well as other enhancements such as "link to a file" and attribution to a code change.


In order to turn on GitHub Enhancements, 3 actions need to be completed for your project:
<ol>
  <li>1. Create a service via the SDK</li>
  <li>2. Add the GitHub Integration to Highlight</li>
  <li>3. Link your service to a GitHub repo</li>
</ol>

## Create a service via the SDK
Services are created to group your logs, errors, and traces by the application that is running the code. Having a service can make it helpful to decipher
which application caused an error, especially in code paths shared by multiple applications. They can also be used also filters for logs and traces.

Services are created by passing in a service name via the SDK. For example, in Golang, the following SDK will create a new service named "my-app":
```
highlight.SetProjectID("<YOUR_PROJECT_ID>")
highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
)
defer highlight.Stop()
```

Reference the [SDK start up guides](../../../getting-started/1_overview.md) for more help. For more information about services, see [Services documentation](../../6_product-features/3_general-features/services.md).

<b>Note:</b> There is also a service version that is provided in the example above. This is not necessary to enable GitHub enhancements, but is recommended that this be the
current GIT SHA of the deployed code to use the most accurate files. If not provided, Highlight will fallback to your current default branch (e.g. main) GIT SHA.

## Add the GitHub Integration to Highlight
Enable GitHub on Highlight by going to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the GitHub section.

More information on the GitHub Integration can be found at [GitHub Integration](../../7_integrations/github-integration.md).

## Link your service to a GitHub repo
Once a service is created, the service will be visible in the metadata of your error. The last step to enable stacktrace enhancements is to link your service to
its respective GitHub repo, the one that should be used to enhance your errors. In addition to linking the repo, there are two fields to configure file path mappings from your
deployment process to the correct file in GitHub.

1. <b>Build path prefix</b> - This path prefix represents a path added in your deployment process, and is also the path in your server that contains your files.
After removing this path (and possibly adding something else), you should be able to point this string to a GitHub file.
2. <b>GitHub path prefix</b> - This path prefix is a string that can be appended to the front of the stacktracepath, and will be prepended to your files in order to correctly find the file in GitHub.

It is recommended to complete with the form while viewing an error, to be able to test your configuration on the viewed error. This can also be completed from the [services table](https://app.highlight.io/settings/services), where all your services can be viewed and managed.

![Service Configuration Form](/images/features/enhancingErrorsWithGithub.png)

An example:
<ol>
    <li>1. An error received has a stacktrace path `/build/main.go`.</li>
    <li>2. The GitHub repo was selected to be the [Highlight repo](https://github.com/highlight/highlight).</li>
    <li>3. Since Highlight's deployment process moves all files out of the `/backend` directory and into the `/build` directory, we would set "Build prefix path"
    to `/backend` and GitHub prefix path to `/backend`.</li>
</ol>
This will result in the following mapping: 
`/build/main.go` -> [https://github.com/highlight/highlight/blob/HEAD/backend/main.go](https://github.com/highlight/highlight/blob/HEAD/backend/main.go).

## Having Issues?
You may notice your service is in an "error" state, and is no longer attempting to enhance errors. This may be due to a bad configuration when linking your service to a repo. If this does not seem to be the case, please reach out to us in our [discord community](https://highlight.io/community).

---
title: Managing Errors
slug: managing-errors
createdAt: 2022-06-01:27:43.000Z
updatedAt: 2022-06-01:34:47.000Z
---

Keeping on top of errors is a challenging effort for any company. Bugs are rarely prioritized and typically don't get attention until a customer writes in about it. Very quickly, errors pile up and it is challenging to distinguish what is signal versus what is noise.

## Resolving errors
Once an error has been fixed, update the status to "Resolved" to remove it from the main Errors view.

## Auto-resolving errors
In your [project settings](https://app.highlight.io/settings), you can auto-resolve errors that haven't been seen for a given time period. If you're trying to manage your error fatigue, we recommend setting this to something low like "7 days". 

## Snoozing errors
If an error is frequently occurring and is causing lots of noise, you can Snooze until a certain time.


## Want additional management features?
If you'd like additional ways to manage errors, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).

---
title: Grouping Errors
slug: grouping-errors
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

Highlight groups errors together based on their error message and stack trace. When an error is thrown, Highlight finds the closest matching error and adds the new error instance to it.

An error is matched if:

- It has the same error message OR

- It has the same top stack frame and 3 of the next 4 stack frames are the same (in any order)

A stack frame is matched if:

- It has the same filename, function name, line number, and column number OR

- It has the same source code and context (if sourcemaps are enabled)

If there is no match with an existing error, a new error group is created instead.

## Grouping Rules

If your errors are in JSON form, you can add JSONPath expressions in your [project settings](https://app.highlight.io/settings) to select parts of your errors that you want to group on. For example, if your errors look like:

```json
{
    "type": "StackOverflowError",
    "user": "alice",
    "message": "Oh no! You got an error on line 41!!"
}

{
    "type": "StackOverflowError",
    "user": "bob",
    "message": "Oh no! You got an error on line 50!!"
}
```

They would not be grouped together since the errors are not an exact match and since they were thrown at different lines in your code. In this case, if you wanted to group all errors of the same type into the same error group, you can add an expression `$.type` in your project settings.

---
title: Error Monitoring
slug: error-monitoring
createdAt: 2021-09-13T23:56:14.000Z
updatedAt: 2022-08-03T19:08:25.000Z
---

---
title: Sourcemaps
slug: sourcemaps
createdAt: 2021-09-13T23:56:14.000Z
updatedAt: 2022-08-03T19:08:25.000Z
---

[highlight.io](https://highlight.io) has first-party support for enhancing minified stacktraces in javacript. We also support options for sending sourcemaps to us in the case that your sourcemaps aren't public. Read more about it in our [getting started doc](../../../getting-started/3_client-sdk/7_replay-configuration/sourcemaps.md)

---
title: Filtering Errors
slug: filtering-errors
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to filter errors that you don't want to see in your error monitoring dashboard. This is useful for errors that you know are not relevant to your application, or for errors that you know are not actionable.

```hint
Filtered errors do not count towards your billing quota.
```

There are several options for filtering errors, all of which can be found in the "Error Monitoring" tab of your [project settings](https://app.highlight.io/settings). Details on each option are below.

## Set up ingestion filters

You can set up ingestion filters by product to limit the number of data points recorded. You can filter sessions, errors, logs, or traces in the following ways:
1. Sample a percentage of all data.
   For example, you may configure ingestion of 1% of all errors. For each session we receive, we will make a randomized decision that will result in storing only 1% of those. The random decision is based on the identifier of that product model for consistency. With traces, the `Trace ID` is used to make sure all children of the same trace are also ingested.
2. Rate limit the maximum number of data points ingested in a 1 minute window.
   For example, you may configure a rate limit of 100 errors per minute. This will allow you to limit the number of errors recorded in case of a significant spike in usage of your product.
3. Set up an exclusion query.
   For example, you may configure an exclusion query of `environment: development`. This will avoid ingesting all errors tagged with the `development` environment.

With these filters, we will only bill you for data actually retained. For instance, setting up ingestion of only 1% of all errors will mean that you will be billed only for 1% of all errors.

## Show errors that have an associated frontend session recorded.
You can use the `disableSessionRecording` setting to record frontend errors without recording a session. 

To find errors that have a session associated, you can use the `Has Sessions` filter in the errors query builder

![](/images/docs/filtering-errors/has-sessions.png)

Once you open an error group instance view, check the `Only instances with recorded sessions` box to filter the instances.
![](/images/docs/filtering-errors/error-object-with-session.png)

## Filter errors emitted by browser extensions
If your users are using browser extensions, you may see errors that are not relevant to your application. You can filter these errors by checking the "Filter errors thrown by browser extensions" box in your [project settings](https://app.highlight.io/settings).

## Ignoring error groups from alerts
If you have alerts set up for your project, you can ignore specific error groups from triggering alerts. You can do this by clicking the "Ignore" button on the error group page.

## Filter errors by regex on the error body
If you'd like to filter specific errors by a regex pattern match against the error body, you can do so by adding error filters in your [project settings](https://app.highlight.io/settings/errors#filters) as well.

## Want to filter something else?
If you'd like an easier way to filter specific types of errors, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).

---
title: Manually Reporting Errors
slug: manually-send-errors
---

In each of our language SDKs, highlight.io supports manually sending errors. This is useful for reporting errors that are not caught by the SDK, or that you would like to define internally as your own application errors. 

In javascript, we support this via the `H.consumeError` method (see our [SDK docs](../../../sdk/client.md)) and in other languages, we maintain this naming convention (pending casing conventions of the language in question.).

Example in javascript:

```js
H.consumeError(error, 'Error in Highlight custom boundary!', {
  component: 'JustThroughAnError.tsx',
});
```

---
title: Overview
heading: Error Monitoring Features
slug: overview
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Error monitoring in [highlight.io](https://highlight.io) is different than most tools, in that we emphasize the mapping between your frontend and backend. Keep reading to learn more about our feature set and get started.

## Get started

<DocsCardGroup>
    <DocsCard title="Get Started"  href="../../../getting-started/1_overview.md">
        {"Get started with session replay by installing highlight.io"}
    </DocsCard>
</DocsCardGroup>

## Features

<DocsCardGroup>
    <DocsCard title="Manually Reporting Errors"  href="./manually-send-errors.md">
        {"Manually report errors that are not caught by the SDK."}
    </DocsCard>
    <DocsCard title="Grouping Errors"  href="./grouping-errors.md">
        {"Logic for grouping errors to mitigate repetition."}
    </DocsCard>
    <DocsCard title="Sourcemaps"  href="./sourcemaps.md">
        {"Configure sourcemaps for your frontend errors."}
    </DocsCard>
    <DocsCard title="Versioning Errors."  href="../../../getting-started/3_client-sdk/7_replay-configuration/versioning-sessions-and-errors.md">
        {"Send highlight.io metadata so you can version errors across deploys."}
    </DocsCard>
    <DocsCard title="Filtering and Ignoring Errors"  href="./filtering-errors.md">
        {"Options for filtering and ignoring errors."}
    </DocsCard>
    <DocsCard title="Managing Errors"  href="./managing-errors.md">
        {"Features for managing errors"}
    </DocsCard>
</DocsCardGroup>

---
title: Tracking Users & Recording Events
slug: welcome-to-highlight
---

## Identifying Users & Tracking Events

With session replay, it can be useful to identify the actual users and track actions that they perform. By default, your users in [highlight.io](https://highlight.io) remain anonymous, but we offer the option to identify and track actions with our javascript SDK. Read more in our [SDK Configuration](../../../getting-started/3_client-sdk/7_replay-configuration/1_overview.md) guide.

![](/images/user-info.png)

## Definition of a Session

A highlight session starts when you `H.init` in your web application (or call `H.start` if you are manually delaying the recording start). Once a session starts, we will continue recording in the same session for up to 4 hours. Each browser tab / instance will start a distinct session, so if your web app is opened in 2 tabs at once, we will record 2 sessions. 

However, once a session starts, it can be resumed. If your web app is opened in a single tab, closed, and then reopened within 15 minutes of closing, we will resume the existing highlight session. If more than 15 minutes have passed, we will start a new session.

**Active time** is the time when a user is interacting with your page with no more than a 10-second gap in activity. For example, if a user is moving their mouse / typing / clicking for 30 seconds with no gaps of longer than 10 seconds, that would count as 30 seconds of active time.

---
title: Session Search
slug: session-search
createdAt: 2022-05-06T23:05:46.000Z
updatedAt: 2022-09-12T16:18:46.000Z
---

In [highlight.io](https://highlight.io), you can search for a session by any of the data you send us (via the SDK) throughout a session. The data you send us can be in the form of:

- [track](../../../getting-started/3_client-sdk/7_replay-configuration/tracking-events.md) calls

- [identify](../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md) calls

- click data

We cover how search/instrumentation for each type of these queries works below.

## Track Searching
For track calls, you can search for sessions based on the properties that have a type of `track`. This looks like the following:

![](/images/track.png)

## Identify Searching
For identify calls, you can search for sessions based on the properties that have a name of `identify`, and the value corresponds to the value sent to the first argument of `H.init` (see [here](../../../sdk/client.md)). This looks like the following.

![](/images/identify.png)

## Searching by User Clicks

When using Highlight, you might be interested in querying for sessions where a user clicked a certain HTML element. Highlight records users' clicks on the page as two queryable properties: `clickSelector` and `clickInnerText`.

- `clickSelector` is the HTML Element's target's selector, concatinating the element's `tag`, `id ` and `class` values.

- `clickTextContent `is the HTML Element's target's `textContent` property. Only the first 2000 characters are sent.

You can then use the session filters to search for text in the two fields. An example of what the `clickSelector` filter looks like is below:

![](/images/click-selector.png)

## Searching by Visited URL

You can also search for sessions based on the URL that the user visited. This is useful if you want to search for sessions where a user visited a certain page on your site.

To perform this search, you can use the `Visited URL` filter. This looks like the following:

![](/images/session-search.png)

And like all of our filters, you can use `contains`, `does not contain`, `is`, and `is not`, etc..
---
title: Dev-tool Window Recording
slug: welcome-to-highlight
---

## Devtools Recording

[highlight.io](https://highlight.io) supports recording all of the resources that you see in the chrome dev-tools window; that is, console messages, network requests and errors. Read more about how to instrument this data in our [sdk configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/1_overview.md). Here's a sneak peak of what this looks like:

![](/images/devtools.png)

---
title: Canvas & Iframe
slug: canvas-iframe
---

## Recording `canvas` elements

[highlight.io](https://highlight.io) supports recording canvas (and therefore WebGL) elements, although due to the nature of `canvas`, there are caveats regarding the quality/fidelity of the recording. Read more about how to get started with this in our [canvas configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/canvas.md). Below is a video demo of what the video recording looks like:

<br/>

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>


## Installing highlight.io in an `iframe`

The highlight.io snippet supports recording within an iframe, but given the security limitations, there are caveats. Read more about this in our [sdk configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/iframes.md#recording-within-iframe-elements).

## Recording Cross-origin `iframe`s

To support recording a cross-origin iframe that you own, we've added functionality into our recording client that allows the iframe to forward its events to the parent session. Read more about this in our [sdk configuration docs](../../../getting-started/3_client-sdk/7_replay-configuration/iframes.md#recording-a-cross-origin-iframe-element).

If you do not own the parent page that is embedding your iframe cross-origin but you still want to record the iframe contents, pass `recordCrossOriginIframe: false` to the `H.init` options to force the iframe to record as a standalone app.
Otherwise, the iframe will wait for the parent page to start recording.

---
title: Shadow Dom + Web Components
slug: canvas-iframe
---

## Shadow DOM & Web Components

[highlight.io](https://highlight.io) supports both [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) and [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) out of the box.

---
title: Extracting the Session URL
headline: The Session URL
slug: session-url
---

In some cases, you may want to extract the Session URL at the time that a user visits your web application to send it your other tools. For example, if you have a customer support tool, many customers like to sent the session URL of their customers to the tool in order to help them debug their issues. 

You can do this by using the the `H.getSessionDetails` method. This method will return an object with a `url` and `urlWithTimestamp` property. Usage is as follows:

```js
      H.getSessionDetails().then(({url, urlWithTimestamp}) => {
          console.log(url, urlWithTimestamp);
      });
```

Please refer to our [SDK docs](../../../sdk/client.md) for more information.
---
title: Player Session Caching
slug: player-session-caching
---

In most cases, the session replayer's local cache allows for a smoother experience when playing back sessions. However, for customers that run a very memory-intensive stack (using canvas recording, or even with lots of changes happening in the dom), the local session player can occosianally slow down the browser tab. We've added a new option to turn off session caching in the highlight dashboard.

You can find this option under Settings > Account Settings > Player Settings.
---
title: Performance Impact
slug: performance-impact
createdAt: 2021-10-14T00:18:49.000Z
updatedAt: 2022-08-08T17:50:32.000Z
---

## Overview

When building Highlight, we've made technical decisions that prioritize putting your site's performance first. Highlight's performance impact on your site, therefore, is negligible, both from the perspective of your user's real-time experience as well as from a page-load perspective.

## Bundle Size

Highlight's gzipped bundle size is a [mere 11 kb](https://www.npmjs.com/package/highlight.run). From a page load perspective, your team should have no qualms regarding Highlight's impact on page load metrics.

## DOM Interaction Performance

Highlight uses the well-maintained [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) browser API in order to record DOM mutations. When sending these changes to our platform, we buffer events periodically to ensure that

1.  Events aren't being held in memory for a prolonged time

2.  Outgoing network requests aren't interfering with user interactions

## Network

Your client will send Highlight telemetry about every 3 seconds. We've taken extra care in making sure we don't overwhelm your end user's machine:

1.  Only 1 request will be in-flight at a given time

2.  Responsive to your end user's network speed

## Session Replay

Concerned about session replay impacting your web application? Read our blog post about it [here](https://highlight.io/blog/session-replay-performance).

---
title: Session Replay
slug: session-replay
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

---
title: Rage Clicks
slug: rage-clicks
createdAt: 2021-10-13T01:46:13.000Z
updatedAt: 2022-08-09T21:26:43.000Z
---

Rage clicks are the equivalent of spamming a close elevator button when you just want to get up to your apartment. But, instead of a close elevator button, it's a space on your application. And instead of getting to your apartment, users usually _rage click_ when a button isn't working as it should.

## How do we identify rage clicks?

A Rage Click is defined as a time periodic in which a user clicks the same area a certain number of times. This can help highlight points of frustration your users have with the app.

By default, we consider user activity as rage clicks when there exists a 2 second or longer period in which a user clicks 5 or more times within a radius of 8 pixels.

## Customizing rage click sensitivity

You'll find fine-grained control over your project's rage click settings in [your project settings page](https://app.highlight.io/settings).

- Elapsed Time (seconds): the maximum time interval during which clicks count toward a rage click.

- Radius (pixels): how close clicks must be to be determined as part of the same rage click.

- Minimum Clicks: the minimum number of nearby clicks required to count as a rage click.

![configuring rage click settings](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/0sgR-VlLcRpAl9SsbDfR-_image.png)

## Alerting for rage clicks

Create a rage click alert [within your project's alerts page](https://app.highlight.io/alerts) to be notified on Slack or via email about a user rage clicking in your app!

![creating a rage click alert](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/XxyLN8kFXtefRgFf1BBUI_image.png)

---
title: Request Proxying
slug: canvas-iframe
---

## Request Proxying

With tools that run from your browser, you run the risk of having requests blocked by ad blockers and chrome extensions. [highlight.io](https://highlight.io) supports [proxying requests](../../../getting-started/3_client-sdk/7_replay-configuration/proxying-highlight.md) through your own domain.

---
title: GraphQL
slug: graphql
---

## Extract operation names

GraphQL famously uses a single endpoint for every request. This makes tracking network requests a special chore.

We've extracted GraphQL operation names and surfaced them in the Session Replay network tab.

![GraphQL operation name](/images/docs/graphql/operation-name.png)

## Payload formatting

GraphQL payloads can be inscrutable, so we've formatted them for you.

![GraphQL operation name](/images/docs/graphql/formatted-payloads.png)
---
title: Session Search Deep Linking
slug: session-search-deep-linking
createdAt: 2022-01-26T19:50:50.000Z
updatedAt: 2022-01-26T21:38:34.000Z
---

The queries you build when searching for sessions are reflected in the URL parameters. You can share these URLs with others to deep link to search results, or even create them programatically.

## Syntax

`/sessions?query={and|or}||{property1},{operator1},{valueA},{valueB}`

- Highlight supports `and` and `or` queries

- User properties:

  - `user_{your_property_name}`

- Track properties:

  - `track_{your_property_name}`

- Sessions built-in properties (these are automatically populated by Highlight):

  - `user_identifier `

  - `session_browser_version`

  - `session_browser_name`

  - `session_device_id`

  - `session_environment`

  - `session_os_name`

  - `session_os_version`

  - `session_referrer`

  - `session_reload`

  - `session_visited-url`

  - `custom_app_version`

  - `custom_created_at`

  - `custom_active_length`

  - `custom_viewed`

  - `custom_processed`

  - `custom_first_time`

  - `custom_starred`

- Operators:

  - `is`

  - `is_not`

  - `contains`

  - `not_contains`

  - `exists`

  - `not_exists`

  - `matches` (uses Lucene regex syntax)

  - `not_matches` (uses Lucene regex syntax)

  - `between` (for active_length)

  - `not_between` (for active_length)

  - `between_date` (for created_at)

  - `not_between_date` (for created_at)

## Examples

Viewing sessions for a particular user:

`/sessions?query=and||user_identifier,is,alice@example.com`

Excluding sessions from your organization:

`/sessions?query=and||user_identifier,not_contains,@yourdomain.com`

Viewing sessions for a particular page in your app:

`/sessions?query=and||session_visited-url,contains,/your/path/name`

Multiple properties

`/sessions?query=or||user_identifier,is,Bob||user_email,is_not,alice@example.com`

---
title: Live Mode
slug: live-mode
createdAt: 2022-03-21T18:28:39.000Z
updatedAt: 2022-03-21T23:31:09.000Z
---

[highlight.io](https://highlight.io) supports tracking users in real-time as they user your web application. When you use highlight.io's Live Mode, the session viewer shows the latest data from users' sessions. It is enabled by default on sessions currently 'live' - eg. when a user is still on the page and sending session data.

While you can view how a session looks to a user in real time, note that some events haven't been processed and will not be visible. Errors, console logs, and network traffic will only be visible when Live Mode is disabled, up to what's most recently processed. In Live Mode, time-scrubbing is disabled since you're always seeing the latest session view.

You can always turn off Live Mode by clicking the toggle button, which will show the session up to the latest data processed. Clicking on the session to write a comment will also disable Live Mode, since comments are associated with a particular timestamp.

---
title: Filtering Sessions
headline: Filtering sessions
slug: filtering-sessions
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to filter sessions that you don't want to see in your session feed. This is useful for sessions that you know are not relevant to your application, or that are not actionable.

```hint
Filtered sessions do not count towards your billing quota.
```

## Set up ingestion filters

You can set up ingestion filters by product to limit the number of data points recorded. You can filter sessions, errors, logs, or traces in the following ways:
1. Sample a percentage of all data.
For example, you may configure ingestion of 1% of all sessions. For each session we receive, we will make a randomized decision that will result in storing only 1% of those. The random decision is based on the identifier of that product model for consistency. With traces, the `Trace ID` is used to make sure all children of the same trace are also ingested. 
2. Rate limit the maximum number of data points ingested in a 1 minute window.
For example, you may configure a rate limit of 100 sessions per minute. This will allow you to limit the number of sessions recorded in case of a significant spike in usage of your product.
3. Set up an exclusion query.
For example, you may configure an exclusion query of `environment: development`. This will avoid ingesting all sessions tagged with the `development` environment.

With these filters, we will only bill you for data actually retained. For instance, setting up ingestion of only 1% of all sessions will mean that you will be billed only for 1% of all sessions (as measured by [our definition of a session](events-and-users.md#definition-of-a-session)). You can configure the filters on [your project settings page in highlight](https://app.highlight.io/settings/filters).

## Filter sessions by user identifier
In some cases, you may want to filter sessions from a specific user. You can do this by adding the user identifier to the "Filtered Sessions" input under the "Session Replay" tab in your [project settings](https://app.highlight.io/settings). Please note that we use the `identifier` (or first argument) sent in your `H.identify` method to filter against (SDK docs [here](../../../sdk/client.md)).

## Filtering sessions without an error
If you're using Highlight mostly for error monitoring, enable the "Filter sessions without an error" in your [project settings](https://app.highlight.io/settings) to only record sessions with an error.

## Filtering sessions using custom logic
If you'd like to filter sessions based on custom logic (e.g. filtering sessions from users who have not logged in), use the [`manualStart` flag](https://www.highlight.io/docs/sdk/client#manualStart) in your `H.init` configuration. This will allow you to start and stop a session at your discretion. 

```js
H.init({
  manualStart: true,
  // ... other options
})
```

Then you can manually start a session by calling `H.start`:

```js
useEffect(() => {
  if (userIsLoggedIn) {
    H.start()
  }
}, [userIsLoggedIn])
```

## Disable all session recording
If you're interested in using Highlight for the error monitoring or logging products without session replay, use the follow setting:
```js
import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    disableSessionRecording: true,
    // ...
});
```

## Want to filter something else?
If you'd like an easier way to filter specific types of sessions, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).

---
heading: Session Replay Features
title: Overview
slug: overview
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

Session replay gives your team visibility into how people use your web app and insight into WHY bugs happen. In [highlight.io](https://highlight.io), we focus heavily on "cohesion", or the mapping of sessions, errors and logs across your stack; that way you get an accurate and comprehensive idea of what happens.

## Get Started

<DocsCardGroup>
    <DocsCard title="Get Started."  href="../../../getting-started/1_overview.md">
        {"Get started with error monitoring by installing highlight.io"}
    </DocsCard>
</DocsCardGroup>

## Features

Read more about the features we support in Session Replay below:

<DocsCardGroup>
    <DocsCard title="Shadow DOM & Web Components."  href="./shadow-dom-web-components.md">
        {"Support for Shadow DOM & Web Components"}
    </DocsCard>
    <DocsCard title="Proxying through your domain."  href="./request-proxying.md">
        {"Support for proxying highlight.io requests through your domain."}
    </DocsCard>
    <DocsCard title="Canvas & Iframe Recording."  href="./canvas-iframe.md">
        {"Support for Canvas & Iframe Recording"}
    </DocsCard>
    <DocsCard title="Devtools Data."  href="./dev-tools.md">
        {"Capturing of console logs, network requests and errors."}
    </DocsCard>
    <DocsCard title="Extracting the Session URL"  href="./session-url.md">
        {"SDK support for extracting the session URL from your sessions."}
    </DocsCard>
    <DocsCard title="Filtering Sessions"  href="./filtering-sessions.md">
        {"Options for filtering sessions."}
    </DocsCard>
    <DocsCard title="Tracking Users & Events."  href="./events-and-users.md">
        {"SDK support for tracking users and their corresponding actions throughout a session."}
    </DocsCard>
    <DocsCard title="GraphQL"  href="./graphql.md">
        {"GraphQL operation names and formatted payloads."}
    </DocsCard>
    <DocsCard title="Live Mode."  href="./live-mode.md">
        {"Support for following a user session in real-time."}
    </DocsCard>
    <DocsCard title="Performance Impact."  href="./performance-impact.md">
        {"The performance impact of the highlight.io snippet."}
    </DocsCard>
    <DocsCard title="Privacy & Redaction."  href="../../../getting-started/3_client-sdk/7_replay-configuration/privacy.md">
        {"Options to redact specific data being recorded in your frontend."}
    </DocsCard>
    <DocsCard title="Rage Clicks."  href="./rage-clicks.md">
        {"Record when users click a specific elemtent frequently."}
    </DocsCard>
    <DocsCard title="Session Search."  href="./session-search.md">
        {"Features that allow you to search for sessions in your app."}
    </DocsCard>
    <DocsCard title="Session Search Deep Linking."  href="./session-search.md">
        {"The URL Schema we use for deep linking sessions."}
    </DocsCard>
    <DocsCard title="Disable Session Caching"  href="./session-caching">
        {"For highlight.io power users, we support disabling session caching to reduce memory usage."}
    </DocsCard>
</DocsCardGroup>

---
title: Product Features
slug: product-features
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

---
title: Changelog 13 (02/24)
slug: changelog-13
---

## The new CommandBar!

Type out "Cmd + K" in your [dashboard](https://app.highlight.io) to search for fields on sessions, errors and more. Here's a sneak peak:

![](/images/cmd-k.png)

## We launched on HackerNews

We launched on hackernews a few days ago, and gained surpassed 1.5k github stars!!! Check out our [launch](https://news.ycombinator.com/item?id=34897645) and if you haven't already, check us out on [github](https://github.com/highlight/highlight).

## Contributing a new SDK:

Interested in adding a new SDK for your for your backend (that isn't support [here](../../getting-started/1_overview.md))? Check out our new docs on [adding an SDK](../4_company/open-source/contributing/adding-an-sdk.md). We're powered by opentelemetry, so adding something for your framework shouldn't be too tough; we're also down to work with you on it!

## Better Doc Search

Thanks to our friends at Algolia, search in our docs is much smoother now! Give it a try with CMD+K.

## New SDKs!!

We've shipped even more SDKS this week:

[Go Fiber](../../getting-started/4_backend-sdk/go.md)

[Python Fast API](../../getting-started/4_backend-sdk/python.md)

## Our new logging product (🤫)

We're making a lot of progress on our new logging product; want to join the beta? Shoot us a message in [discord](https://highlight.io/community)

## Improvements

Self-hosting improvements ([docs](../4_company/open-source/hosting/2_self-host-hobby.md))
Lots of work on logging!

---
title: Changelog 17 (04/07)
slug: changelog-17
---

![](/images/setup.png)
## New setup page just dropped!
We just launched a new setup page that makes it easier to get started with [highlight.io](https://highlight.io). Check it out at [https://app.highlight.io/setup](https://app.highlight.io/setup).

## Ability to turn off session caching for high-memory playback.
For customers that run a very memory-intensive stack (using canvas recording, or even with lots of changes happening in the dom), the local session player can occosianally slow down the browser tab. We've added a new option to the [highlight.io](https://highlight.io) config to turn off session caching. See docs [here](../6_product-features/1_session-replay/player-session-caching.md).

[PR Link](https://github.com/highlight/highlight/pull/4758)

## Setting up alerts no longer require a slack connection.
Before this change, there was a bug that made it difficult to set up alerts without a slack channel. This is no longer the case.

[PR LInk](https://github.com/highlight/highlight/pull/4748)

## Docs and landing (at highlight.io) now live in our main repo.
Its now easier to contribute to our docs and landing page now that they both live in the same repo!

[PR Link](https://github.com/highlight/highlight/pull/4703)

## Support for codespaces for contributors.
Interested in contributing to [highlight.io](https://highlight.io)? Its now easier than ever to get started with our new codespaces setup. Check out our [contributing guide](../4_company/open-source/contributing/1_getting-started.md) for more info.

[PR Link](https://github.com/highlight/highlight/pull/4669)

## Lots of logging updates!
Launch coming soon...


---
title: Changelog 23 (08/22)
slug: changelog-23
---

## Visual indicator in Session Replay devtools

Sessions can be long and contain huge lists of items.

As you watch your session replay, you can now see the items progress through the list automatically, with an indicator that tells you if the item is before or after the current timestamp.

<EmbeddedVideo 
  src="https://www.loom.com/embed/1f1b97e2bdf145869ae41efb5b182c13?sid=80aded93-467c-419c-91c1-d5d8eaa16d9f"
  title="Loom"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Poll for new session, errors and logs

We often found ourselves refreshing our Highlight dashboard to update our data.

Highlight's web app now polls for new sessions, errors and logs, so you don't have to refresh the page every few seconds.

New results cause a button to pop up, prompting you to load the new records.

<EmbeddedVideo 
  src="https://www.loom.com/embed/0c7ce5a684294081ba2b0743a61710d0?sid=d10d7d9d-addc-4fa8-a532-d73139b7e521"
  title="Loom"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Pino.js log support

We've added support for yet another logging provider!

Welcome [pino.js](https://getpino.io/#/) to the Highlight log family.

![Pino.js screenshot](/images/changelog/23/pino-logging.png)

## Alerts redesign

We're working through a series of redesigns for our Alerts forms.

Check out our progress 👇

<EmbeddedVideo 
  src="https://www.screencast.com/users/ChrisEsplin/folders/Snagit/media/0564d1e9-eb2a-43e0-b072-f400b1565a46/embed"
  title="Screencast.com"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

---
title: Changelog 16 (03/19)
slug: changelog-16
---

## Logging is in Alpha!

Lots more to come on the logging front, but please check give our logging product a peak at [https://app.highlight.io/logs](https://app.highlight.io/logs)!

![](/images/logging.png)

## Added support for Nest.js

Guide link [here](https://www.highlight.io/docs/getting-started/backend-sdk/js/nestjs).

---
title: Changelog 22 (08/07)
slug: changelog-22
---

## Remix SDK at v0

Remix works great with Highlight. It was surprisingly easy to instrument.

Check out our [@highlight-run/remix docs](https://www.highlight.io/docs/getting-started/fullstack-frameworks/remix) for an easy walkthrough.

![Remix to Highlight](/images/changelog/22/remix-to-highlight.jpg)

## Render.com Log Stream

Quickly and easily configure a Render log drain with Highlight: https://dub.sh/UmfNHwu

![Render to Highlight](/images/changelog/22/render-to-highlight.jpg)


## Canvas Manual Snapshotting

[@Vadman97](https://github.com/Vadman97) solved a long-standing issue with WebGL double buffering. The WebGL memory would render a transparent image even though the GPU was rending the image correctly. This caused missing images in Session Replay.

Take full control over your Canvas snapshots with the [manual snapshotting docs](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/canvas#manual-snapshotting)

![Render to Highlight](/images/changelog/22/canvas-snapshot.jpg)


## Set "Service Name" and "Service Version" with the Python and Go SDKs

We've added `service_name` and `service_version` parameters to the [Python SDK](https://www.highlight.io/docs/sdk/python#servicename) and the [Go SDK](https://www.highlight.io/docs/sdk/go#highlightStart).

These params make logs much more searchable.

![Python Service Name](/images/changelog/22/service-name.png)

## 🚨Community Contribution 🚨 

#### Repaired scrolling in metadata

Shout out to to Kalkidan Betre—[@kalibetre](https://github.com/kalibetre) on GitHub—for their open source contribution. They noticed that our Metadata window on the Session Replay screen wasn't scrolling correctly, and they sent in a pull request to fix it.

Thanks Kalkidan!

![Metadata scroll](/images/changelog/22/metadata-scroll.gif)


---
title: Changelog 26 (11/08)
slug: changelog-26
---

## Client-side network sanitizing

Sanitize your network requests on the client, preventing sensitive data from ever reaching Highlight's servers.

Check out the docs for our web client's [requestResponseSanitizer](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses#custom-sanitizing-of-response-and-requests) function.

<EmbeddedVideo 
  src="https://www.loom.com/embed/47ce07c349f14e9aa3fb802b21221167?sid=f034e880-4e45-4477-82e7-cc763dd0378b"
  title="Session Export"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Tracing improvements

We're hard at work on Tracing, building out new features every day.

Check out the latest two features:

1. Traces embedded in Session Replay network requests:
![Network Request Trace](/images/changelog/26/network-request-trace.png)

2. A fresh, new flame graph to better visualize sources of latency:
![Traces Beta](/images/changelog/26/traces-beta.png)

## Next.js tracing support

We continue to roll out improvements to our popular Next.js SDK, prioritizing Vercel support.

Highlight can now consume Next.js's [built-in OpenTelemetry instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry). This means free request/response spans for Next's Node runtime. We've also re-worked our [Next.js SDK docs](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js/overview) to streamline your integrations.

We have walkthroughs for both the Page and App Routers, as well as details on our Edge Runtime support.


## Java 11 support

We got a request for Java 11 support, so we hopped on it! 

Integrate your Java 11 application with our [Java docs](https://www.highlight.io/docs/getting-started/backend-sdk/java/other) today.

---
title: Changelog 12 (02/17)
slug: changelog-12
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

## Open Source!

highlight.io is open source at [https://github.com/highlight/highlight](https://github.com/highlight/highlight) (would appreciate a star ⭐️). We've also got lots of updates to share on this front as we grow, so stay tuned!

## Changing the status of an error is now instant!

We're now using `optimisticResponses` in apollo to update the state of an error. When you change the status, this now happens instantly in the UI 🤯.

[PR Link](https://github.com/highlight/highlight/pull/4246)

## Smoother frontend routing logic.

We upgraded react router this week, which has made some significant performance improvements to the app; switching between errors/sessions is now silky smooth.

[PR Link](https://github.com/highlight/highlight/pull/4203)

## New SDKs!!

We now support several more Python SDKs: Flask, Django, Python Azure Functions.

[Python Docs](https://www.highlight.io/docs/general/getting-started/backend-sdk/python)

[Cloudflare Docs](https://www.highlight.io/docs/general/getting-started/backend-sdk/cloudflare)

---
title: Changelog 19 (05/22)
slug: changelog-19
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/AcIfUZeJjjs"
  title="Youtube"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Demo Project

Check out [our new demo project](https://app.highlight.io/demo).

You can play around and see how the Highlight application works with a live project with plenty of data.

Look closely. You might be able to find your own `highlight.io` sessions recorded on the demo project. That's right! We use Highlight ourselves, and we pipe all of our data to the demo project.

![demo project](/images/changelog/19/demo-project.png)

## Comment UI Facelift

We've given the Comment UI a facelift.

-   It fits better with our design system.
-   We have a new draggable handle just below the session timeline.
-   New inline issue creation for connected issue trackers (GitHub, Linear, Height)

![comment ui facelift](/images/changelog/19/comment-ui.png)

## Winston.js Highlight Transport

Check out our new [Winston.js Highlight Transporter](https://www.highlight.io/docs/getting-started/backend-logging/js/winston)!

You can log to Winston as per usual, and Highlight will capture your logs and display them on your Highlight application.

## Canvas recording is getting even more powerful

We dug deep into our most complex Canvas implementation with multiple overlaying canvases on a single page.

We're snapshotting blob videos using Canvas and capturing frames from multiple canvases, regardless of overlays.

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>

## Option to only record session with errors

Highlight users with an enormous number of sessions may not want to record all of them.

You can now opt into error-only recording. If the session throws an error, we'll record it. If not, that session never hits your Dashboard.

![exclude sessions without errors](/images/changelog/19/exclude-sessions-without-errors.png)

---
title: Changelog 18 (04/26)
slug: changelog-18
---

![](https://user-images.githubusercontent.com/20292680/234690301-9fcf51a0-cf1d-4c22-b5e6-0915640bd7ec.png)

## Error boundary improvements!
We just shipped a bunch of improvements to our error boundary. Namely:
- No longer required to import a `.css` file.
- Lots of design updates (see above)

## GitHub Integration is live
Our GitHub integration is now live. Checkout the [docs here](https://www.highlight.io/docs/general/integrations/github-integration).

## Docs for our hobby deploy is live
You can now deploy Highlight.io on a hobby instance. It's important to note that this is different from our dev deploy, which is used for developing on Highlight (useful for contributors). The hobby deploy is for folks that want to self-host Highlight for a low-traffic setup. Docs [here](https://www.highlight.io/docs/getting-started/self-host/self-hosted-hobby-guide).

## Open Source Updates
### Launch week recap
Interested in hearing about how our launch week went last week? Take a look on our blog [here](https://www.highlight.io/blog/tag/launch-week-1).
### GitHub Discussion on Error Monitoring
We're focusing on improving our error monitoring product this upcoming quarter. Please share on this [GitHub discussion](https://github.com/highlight/highlight/discussions/5099).
    

---
title: Highlight.io Changelog
slug: changelog
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

---
title: Changelog 15 (03/11)
slug: changelog-15
---

## Added a "goto" button on each devtools resource.

In the devtools panel, you can now directly click a "goto" icon on an error, network request, or log. Check it out:

[PR Link](https://github.com/highlight/highlight/issues/4485)

![](/images/goto.png)

## More improvements to replay speed + jitters.

Small issues related to caching the time of a given session across multiple sesions.

[PR Link](https://github.com/highlight/highlight/issues/4499)

## Slack alerts link to a specific instance.

Slack alerts normally linked to the error group, but didn't link to the specific instance. We now link to the exact instance of an error that way you click into the relevant session.

[PR Link](https://github.com/highlight/highlight/issues/4485)

## New product pages on our landing page.

We just added some new product pages on our landing page. Take a look and share feedback if you like:

- [highlight.io/session-replay](https://www.highlight.io/session-replay)

- [highlight.io/error-monitoring](https://www.highlight.io/error-monitoring)

- [highlight.io/logging](https://www.highlight.io/logging)

## SVB Exposure

[Highlight.io](https://highlight.io) luckily had no exposure to the revent SVB situation, however, we understand that many of our customers might. If this is the case, and you need payment relief for your subscription, please reach out to us at [support@highlight.io](mailto:support@highlight.io).

---
title: Changelog 21 (06/21)
slug: changelog-21
---

## GitHub Authentication

By popular request, we've implemented [GitHub sign up](https://github.com/highlight/highlight/pull/5584). We've linked it to your primary GitHub email through Firebase authentication.

## Invite detection

Many users come directly to Highlight because their team is using the product but they don't realize that they need to come through an invite link in order to join their workspace.

We now check for available workspace invitations on sign up, so team members will be more likely to join their workspace as intended.

![invite detection](/images/changelog/21/invite-detection.png)

## AllContributor GitHub App

We've installed the [AllContributor](https://allcontributors.org/docs/en/bot/installation) GitHub app and integrated it with our codebase.

![all contributors](/images/changelog/21/all-contributors.png)

## New Slack Embed

We already support tagging a Slack channel in a session comment.

Now we take a screenshot of that session and embed it in the Slack channel to add extra context to the message.

![Slack embed](/images/changelog/21/slack-embed.png)

## Hobby Deploy off localhost

The Hobby Deploy assumed that it would always host itself on `localhost`.

We fixed that issue by passing `REACT_APP_PRIVATE_GRAPH_URI` and `REACT_APP_PUBLIC_GRAPH_URI` to the Docker containers, so you can configure the endpoints to run on any domain you like.

## Python 3.11 Support

Our SDK now supports Python 3.11.






---
title: Changelog 25 (10/03)
slug: changelog-25
---

## GitHub Enhancement Settings

We recently released GitHub-enhanced stack traces, and now we've surfaced your enhancement settings right next to your stack traces. It's a quality-of-life enhancement that unearths your buried settings and puts them right where you need them.

![GitHub stack trace settings](/images/changelog/25/github-stacktrace-settings.jpg)

## Edge-compatible Next.js

We've got errors, logs and sessions working on Vercel's Edge runtime with both Page and App Router!

The docs are a work-in-progress, but they're all available on our [Next.js Walkthrough](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js) page.

We've got new API endpoint wrappers that work with Vercel's serverless Node.js functions. And we've got a new Edge-specific API endpoint wrapper that's compatible with Edge's stripped-down API.

![Vercel Errors](/images/changelog/25/vercel-errors.webp)

## Session Exporting is getting easier.

Canvas rendering can get huge, which was causing problems with session export.

We're now rendering each Canvas chunk to a separate mp4 file so that they can export within Lambda timeout limits.

<EmbeddedVideo 
  src="https://www.loom.com/embed/2ea8b9c3f43d451285536410aa9cf325?sid=21bc2304-f230-4f50-9c8f-266e12c5fe80"
  title="Session Export"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>


---
title: Changelog 24 (09/11)
slug: changelog-24
---

## GitHub-enhanced stack traces

Highlight is all about tight integrations. We’ve expanded our GitHub integration to link stack traces directly to the relevant files in your GitHub repo.

It’s easy to enable and even easier to use. 

It seems like a tiny feature at first, but it’ll spoil you. You’ll question how you ever lived without it.

[GitHub Integration Docs](https://www.highlight.io/docs/general/product-features/error-monitoring/enhancing-errors-with-github)

<EmbeddedVideo 
  src="https://www.loom.com/embed/5b362125ffd94e8cba1f442b5fc56ded?sid=462a9bbd-5bd4-436e-8ddf-6940a8cd79e4"
  title="Loom"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Session search moves to ClickHouse

We’ve shipped a new UI for searching sessions, and session search is now fully powered by ClickHouse. That means you get a snappy search experience with real-time previews of the keys you can use to search.

![Session Search Filters](/images/changelog/24/search-filters.png)

## Algora open-source bounties

We’ve been posting bounties to [Algora.io](https://algora.io/), and folks have been claiming them!

Our core team is stretched thin enough with feature work and the tricky, involved bugs that we prioritize every day, which leaves all the small bugs to languish, unaddressed. Until now! 

Algora is helping us stay focused while incentivizing the Highlight community to close out bugs and claim some cold, hard cash.

If this program keeps growing, will we even need a core team???

![Algora dashboard](/images/changelog/24/algora.jpg)

## Error tag embeddings

We’ve been playing around with Large Language Model (LLM) embeddings and applying them to our error data.

Now that we’re saving embeddings for each of our errors, we might as well make those embeddings searchable!

Visit [app.highlight.io/error-tags](https://app.highlight.io/error-tags) to see our latest experiment. We’ve made our internal Highlight App errors taggable and searchable via LLM. Toss in an error message of your own, or test one of our error messages to see how the system categorizes it.

![error tags](/images/changelog/24/error-tags.png)

---
heading: Changelog Overview
title: Overview
slug: getting-started
---

Stay up to date with what we work on week over week:

<DocsCardGroup>
    <DocsCard title="Changelog 26" href="./changelog-26.md">
    {"Client-side network sanitizing, Tracing beta improvements, Next.js tracing, Java 11 support."}
    </DocsCard>
    <DocsCard title="Changelog 25" href="./changelog-25.md">
    {"GitHub stack trace settings, Next.js Edge runtime support, Large session exports"}
    </DocsCard>
    <DocsCard title="Changelog 24" href="./changelog-24.md">
    {"GitHub-enhanced stack traces, Session search on ClickHouse, Algora.io open-source bounties"}
    </DocsCard>
    <DocsCard title="Changelog 23" href="./changelog-23.md">
    {"Error list visual indicator, Poll for new sessions, Pino.js support, Alerts redesign "}
    </DocsCard>
    <DocsCard title="Changelog 22" href="./changelog-22.md">
    {"Remix SDK, Render.com Log Stream, Go & Python SDK updates"}
    </DocsCard>
    <DocsCard title="Changelog 21" href="./changelog-21.md">
    {"GitHub Auth, Invite detection, AllContributor App"}
    </DocsCard>
    <DocsCard title="Changelog 20" href="./changelog-20.md">
    {"User Management, New logging connectors"}
    </DocsCard>
    <DocsCard title="Changelog 19" href="./changelog-19.md">
    {"Demo project, Comment UI facelift, etc."}
    </DocsCard>
    <DocsCard title="Changelog 18" href="./changelog-18.md">
    {"Error boundary improvements, GitHub ticket integration, etc."}
    </DocsCard>
    <DocsCard title="Changelog 17" href="./changelog-17.md">
    {"New Setup Page, Session caching, etc."}
    </DocsCard>
    <DocsCard title="Changelog 16" href="./changelog-16.md">
    {"Logging is in Alpha!"}
    </DocsCard>
    <DocsCard title="Changelog 15" href="./changelog-15.md">
    {"New Product Pages & Devtools Improvements!"}
    </DocsCard>
    <DocsCard title="Changelog 14" href="./changelog-14.md">
    {"New Signup Flow, Python Guides, & Session Replay Fixes!"}
    </DocsCard>
    <DocsCard title="Changelog 13" href="./changelog-13.md">
    {"HackerNews Launch, SDK Docs, DocSearch, etc."}
    </DocsCard>
    <DocsCard title="Changelog 12" href="./changelog-12.md">
    {"Open Source, Smoother UX, & New SDKs!"}
    </DocsCard>
</DocsCardGroup>

---
title: Changelog 14 (03/03)
slug: changelog-14
---

## Our New Signup Flow!

We just shipped a new signup flow on [app.highlight.io](https://app.highlight.io). Feel free to give a try :)

![](/images/signup.png)

## Fixes to Replay Jitters

This week, we made quite a lot of improvements to jitter/jank on the replay timeline. Notably, there was a bug related to inactive periods as well as the timeline UI resetting multiple times.

[PR Link](https://github.com/highlight/highlight/pull/4422)

## New Python Guide Homepage

Our python guides now have a new home; check them out [here](../../getting-started/4_backend-sdk/python/1_overview.md).

## More Logging Updates (🤫)

We're making a lot of progress on our new logging product; want to join the beta? Shoot us a message in [discord](https://highlight.io/community).

---
title: Changelog 20 (06/06)
slug: changelog-20
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/3t5d8Jyg044"
  title="Youtube"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## User management features

Spencer Amarantides joined our team last week and has already shipped his first feature!

We can now create, view and delete Highlight team invites.

![pending invites](/images/changelog/20/pending-invites.png)

And the email that invited users receive is now cleaner and easier to understand.
![invite email](/images/changelog/20/invite-email.png)

## New Logging connectors

-   [AWS Kinesis](../../getting-started/5_backend-logging/06_hosting/aws.md#aws-kinesis-firehose-for-logs-from-infrastructure-or-other-services)

-   [Fluent Forward](../../getting-started/5_backend-logging/10_fluentforward.md)
-   [Filesystem](../../getting-started/5_backend-logging/09_file.md)
-   [Loguru](../../getting-started/5_backend-logging/03_python/loguru.md)

These new connectors make Highlight much easier to use with AWS, Docker, custom VMs and Python!

We've long supported Open Telemetry's logging protocol, but now we also support Fluent Forward, which will make working with AWS and other Fluent-Forward-compatible systems much easier.

---
title: Get Started
slug: welcome-to-highlight
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

<DocsCardGroup>
    <DocsCard title="Get Started" href="../getting-started/1_overview.md">
        {"Integrate highlight.io into your web app."}
    </DocsCard>
</DocsCardGroup>

---
title: Roadmap
heading: Our Public Roadmap
quickstart: true
---

Read about what we’re considering, what we have planned, and what we’re building!

<Roadmap content={roadmapData} />

---
title: Front Integration
slug: front-integration
createdAt: 2022-09-08T23:51:48.000Z
updatedAt: 2022-10-12T16:58:46.000Z
---

Do you use [Front.com](https://app.frontapp.com/) to communicate with your customers? Add the Highlight plugin and view Highlight sessions right from the conversation.

![See Highlight Sessions from Front](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/aZFnCEkEtEJpP1zA75J9r_front-highlight-v2.png)

Simply visit [https://app.frontapp.com/settings/tools](https://front.com/integrations/highlight) and add the Highlight plugin in one click.

Click the [Get Started](https://app.frontapp.com/settings/integrations/native/edit/highlight) button to add Highlight to your Front workspace.

---
title: Height Integration
slug: height-integration
createdAt: 2023-01-10:42:47.000Z
updatedAt: 2023-01-10:45:25.000Z
---

When you enable the Height integration, Highlight will allow creating Tasks from the session replay and errors viewer. Track bugs or enhancements for your app as you triage frontend and backend errors or watch your users' replays.

To get started, go to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the Height section.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) can create a Height task filled out with the body of the comment and link back to the Session.

2.  [Grouping Errors](../6_product-features/2_error-monitoring/grouping-errors.md) shows a shortcut to create a Height task pre-populated with the error linking to the full context of how the error occurred.

---
title: Intercom Integration
slug: intercom-integration
createdAt: 2021-12-03T23:56:12.000Z
updatedAt: 2021-12-09T00:20:50.000Z
---

Highlight makes it easy to send events to Intercom. If you have both Highlight and Intercom already configured, then you're all set. We've already set things up for you in the background.

If you want to disable this integration, you can set `enabled: false` for the integration in your client config:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    intercom: {
      enabled: false,
    },
  },
})
```

## Messaging

Whenever a user sends you a message on Intercom, Highlight will add a [custom user attribute](https://www.intercom.com/help/en/articles/179-send-custom-user-attributes-to-intercom) called `highlightSessionUrl` to the user. This is the URL for the latest session created by that user. This is helpful to see what the user was doing that led up to the user sending a message.

## API

### `trackEvent`

Calling [`H.track`](../../sdk/client.md#Hinit) will forward the data to Intercom's [`Intercom('trackEvent')`](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomtrackevent).

```typescript
H.track('signup_button_clicked', {
  firstTime: true,
  impressions: 10,
})

// The Highlight track call is equivalent to this Intercom call
Intercom('trackEvent', 'signup_button_clicked', {
  firstTime: true,
  impressions: 10,
})
```

---
title: Vercel Integration
slug: apps-vercel-integration
createdAt: 2022-10-13T18:03:19.000Z
updatedAt: 2022-10-13T18:09:17.000Z
---

If you use Vercel to deploy your app, you can install the Vercel Highlight integration here: [https://vercel.com/integrations/highlight/](https://vercel.com/integrations/highlight/). Below are the details of what this integration provides.

## Vercel SDK Integrations

After linking your Vercel projects to your Highlight projects, Highlight will automatically set the `HIGHLIGHT_SOURCEMAP_API_KEY` environment variable. If you're using `@higlight-run/sourcemap-uploader` or `withHighlightConfig` to upload your sourcemaps, those tools will check for this API key.

More details on calling these methods [here](../../getting-started/fullstack-frameworks/next-js/index.md#test-sourcemaps).

## Vercel Log Drain Integrations

If you use Vercel to deploy your server-side applications, the Vercel integration will also send your logs to Highlight. Vercel will forward build logs, lambda and edge function (server-side) logs, and static access logs. You can view these logs in the Highlight UI by clicking on the "Logs" tab in your dashboard. To configure whether to collect logs in highlight.io, you can do this by limiting logs in your billing settings.

More details on turning on this integration [here](../../getting-started/5_backend-logging/06_hosting/vercel.md).

---
title: Discord Integration
slug: discord-integration
createdAt: 2021-09-17T21:48:44.000Z
updatedAt: 2021-09-17T21:56:27.000Z
---

By connecting Highlight with Discord, Highlight can send you and your team real-time messages based on different sessions, errors and more.

To get started, go to [app.highlight.io/integrations](https://app.highlight.io/alerts) and click the toggle to turn on the discord integration.

![](/images/discord-integration-toggle.png)

Once you do this, you will see an option to add discord channels on any of the alerts found at [https://app.highlight.io/alerts](https://app.highlight.io/alerts). It'll look like this:

![](/images/discord-alert-view.png)

---
title: Amplitude Integration
slug: amplitude-integration
createdAt: 2021-09-13T23:57:13.000Z
updatedAt: 2021-09-17T21:52:19.000Z
---

We've made it easy to use Amplitude with Highlight. When you initialize Highlight, you can set your Amplitude API Key.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    amplitude: {
      apiKey: '<AMPLITUDE_API_KEY>',
    },
  },
})
```

## API

### `logEvent()`

Calling [`H.track()`](../../sdk/client.md#Hinit) will forward the data to Amplitude's [`logEvent()`](https://amplitude.github.io/Amplitude-JavaScript/#amplitudeclientlogevent).

```typescript
H.track('signup_button_clicked', {
  firstTime: true,
  impressions: 10,
})

// The Highlight track call is equivalent to this logEvent call
amplitudeClient.logEvent('signup_button_clicked', {
  firstTime: true,
  impressions: 10,
  // This property is added by Highlight. This shows you the session where this event happened.
  highlightSessionURL: 'https://app.highlight.io/sessions/123',
})
```

### `setUserId()` and `identify()`

Calling [`H.identify()`](../../sdk/client.md#Hinit) will forward the data to Amplitude's [`setUserId()`](https://amplitude.github.io/Amplitude-JavaScript/#amplitudeclientlogevent) and [`identify()`](https://amplitude.github.io/Amplitude-JavaScript/Identify/).

```typescript
H.identify('eliza@corp.com', {
  planType: 'premium',
  verified: false,
})

// The Highlight identify call is equivalent to setUserId and identify.
amplitudeClient.setUserId('eliza@corp.com')
amplitudeClient.identify(new amplitude.Identify().set('planType', 'premium').set('verified', false))
```

If you want to disable this behavior, you can set `enabled: false` for the integration:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    amplitude: {
      enabled: false,
    },
  },
})
```

---
title: ClickUp Integration
slug: jLzG-clickup-integration
createdAt: 2023-01-10:42:47.000Z
updatedAt: 2023-01-10:45:25.000Z
---

When you enable the ClickUp integration, Highlight will allow creating Tasks from the session replay and errors viewer. Track bugs or enhancements for your app as you triage frontend and backend errors or watch your users' replays.

To get started, go to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the ClickUp section.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) can create a ClickUp task filled out with the body of the comment and link back to the Session.
2.  [Grouping Errors](../6_product-features/2_error-monitoring/grouping-errors.md) shows a shortcut to create a ClickUp task pre-populated with the error linking to the full context of how the error occurred.

---
title: Pendo Integration
slug: pendo-integration
createdAt: 2021-09-13T23:57:09.000Z
updatedAt: 2021-12-03T23:56:06.000Z
---

```hint
Highlight's Pendo integration is in alpha. In order to use it, you must request access from Highlight [support](mailto:support@highlight.io).
```

We've made it easy to use Pendo with Highlight. If you don't already have Pendo initialized in your app, you can have Highlight initialize it for you by specifying your Pendo Project Token in the config.


```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    pendo: {
      projectToken: '<PENDO_PROJECT_TOKEN>',
    },
  },
})
```

Whenever you call [`H.track()`](../../sdk/client.md#Htrack) or [`H.identify()`](../../sdk/client.md#Hinit) it will forward that data to Pendo's `track` and `identify` calls. If you want to disable this behavior, you can set `enabled: false` for the integration:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    pendo: {
      enabled: false,
    },
  },
})
```

## API

### `track()`

Calling [`H.track()`](../../sdk/client.md#Htrack) will forward the data to Pendo's `track()`. Highlight will also add a Pendo property called `highlightSessionURL` which contains the URL to the Highlight session where the track event happened.

### `identify()`

Calling [`H.identify()`](../../sdk/client.md#Hidentify) will forward the data to Pendo's `identify()`.

---
title: GitHub Integration
slug: github-integration
createdAt: 2022-06-06T01:42:47.000Z
updatedAt: 2022-06-06T16:45:25.000Z
---

When you enable the GitHub integration, Highlight will allow creating Issues from the session replay and errors viewer. Track bugs or enhancements for your app as you triage frontend and backend errors or watch your users' replays. Enhance backend error stacktraces with GitHub's file context.

To get started, go to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the GitHub section.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) can create a GitHub issue filled out with the body of the comment and link back to the Session.

2.  [Grouping Errors](../6_product-features/2_error-monitoring/grouping-errors.md) shows a shortcut to create a GitHub issue pre-populated with the error linking to the full context of how the error occurred.

3.  [Enhance Error Stacktraces](../6_product-features/2_error-monitoring/enhancing-errors-with-github.md) by using context fetched from files on GitHub.

---
title: Linear Integration
slug: linear-integration
createdAt: 2022-06-06T01:42:47.000Z
updatedAt: 2022-06-06T16:45:25.000Z
---

When you enable the Linear integration, Highlight will allow creating Issues from the session replay and errors viewer. Track bugs or enhancements for your app as you triage frontend and backend errors or watch your users' replays.

To get started, go to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the Linear section.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) can create a Linear issue filled out with the body of the comment and link back to the Session.

2.  [Grouping Errors](../6_product-features/2_error-monitoring/grouping-errors.md) shows a shortcut to create a Linear task pre-populated with the error linking to the full context of how the error occurred.

---
title: Grafana Integration
slug: grafana-integration
createdAt: 2021-09-17T21:48:44.000Z
updatedAt: 2021-09-17T21:56:27.000Z
---

We support integrating with Grafana to visualize metrics from your applications frontend and backend.
Track network request latency, application errors, and backend traces all in one place. You'll get customization
into aggregate query types (p50, p99, etc.) for performance and availability metrics automatically captured from
our SDKs, with the ability to report custom metrics and traces as well.

![](/images/docs/grafana.png)

### How it works

We expose a Grafana Data Source that you can configure in your own self-hosted or cloud-managed Grafana instance.
Once you have your highlight.io account connected, you can build your own dashboards and write queries to our
API. We also support exposing our backing analytics data store, ClickHouse, so that your team can write
SQL queries and get raw access to slice / dice the data.

![](/images/docs/grafana-zoom.png)

Interested in getting this set up? Reach out to us at [support@highlight.io](mailto:support@highlight.io).

---
title: Integrations
slug: integrations
createdAt: 2021-09-15T00:00:28.000Z
updatedAt: 2022-10-13T21:15:18.000Z
---

---
title: Segment Integration
slug: segment-integration
createdAt: 2021-10-18T22:03:24.000Z
updatedAt: 2022-06-13T15:44:38.000Z
---

If you have an existing codebase calling [Segment's](https://segment.com/docs/connections/spec/) `identify()` and `track()` methods, then you won't have to call Highlight's. Highlight will automatically forward data sent to Segment to your Highlight sessions.

```hint
We are currently working with Segment on an official integration where you can enable, configure, and send data to Highlight. If you'd like to use this, then [upvote this feature request](https://highlight.canny.io/feature-requests/p/official-segment-integration).
```

## Enabling the Segment Integration

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableSegmentIntegration: true,
})
```

Segment's `identify()` calls will now start forwarding to Highlight.

## Enabling Track data forwarding

To forward `analytics.track()` calls to Highlight, you will need to use the `HighlightSegmentMiddleware`. This is available in the `highlight.run` package starting in version `2.10.0`.

```javascript
import { H, HighlightSegmentMiddleware } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  enableSegmentIntegration: true,
})
analytics.addSourceMiddleware(HighlightSegmentMiddleware)
```

## Searching for segment events

Searching for segment events is as easy as using the `segment-event` filter in the session search UI. This is what it looks like. 

![](/images/segment-search.png)

---
title: Jira Integration
slug: jira-integration
createdAt: 2023-10-20T00:00:00.000Z
updatedAt: 2023-10-20T00:00:00.000Z
---

When you enable the Jira integration, Highlight will allow creating Tasks from the session replay and errors viewer. Track bugs or enhancements for your app as you triage frontend and backend errors or watch your users' replays.

To get started, go to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the Jira section.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) can create a Jira task filled out with the body of the comment and link back to the Session.

2.  [Grouping Errors](../6_product-features/2_error-monitoring/grouping-errors.md) shows a shortcut to create a Jira task pre-populated with the error linking to the full context of how the error occurred.

---
title: Electron Support
slug: electron-integration
createdAt: 2022-09-29T04:16:22.000Z
updatedAt: 2022-10-13T18:04:13.000Z
---

If you are running Highlight in Electron, a Desktop based JS framework, you can benefit from the additional functionality that tracks main process window events to stop and start Highlight recording when your app is minimized.

Please ensure you are using Highlight SDK version [highlight.run@4.3.4.](https://www.npmjs.com/package/highlight.run/v/4.3.4) or higher. Call `configureElectronHighlight` with a `BrowserWindow` object to instrument Electron events.

```Text
const mainWindow = new BrowserWindow(...)
configureElectronHighlight(mainWindow)
```

Under the hood, the function will forward the `focus` and `blur` events to your renderer process so that the highlight recording SDK can track them.

```Text
mainWindow.on('focus', () => {
    mainWindow.webContents.send('highlight.run', { visible: true });
});
window.on('blur', () => {
    mainWindow.webContents.send('highlight.run', { visible: false });
 });
```

This will stop all highlight recording when the app is not visible and resume the session when the app regains visibility to help minimize performance and battery impact that Highlight may have on Electron users.

---
title: Slack Integration
slug: slack-integration
createdAt: 2021-09-17T21:48:44.000Z
updatedAt: 2021-09-17T21:56:27.000Z
---

By connecting Highlight with Slack, Highlight can send you and your team real-time messages based on different events that happen on your app and Highlight.

To get started, go to [https://app.highlight.io/alerts](https://app.highlight.io/alerts) and click the "Sync with Slack" button.

## Features

1.  [Comments](../6_product-features/3_general-features/comments.md) will send a Slack message to whoever is tagged in a comment

2.  [Alerts](../6_product-features/3_general-features/alerts.md) will send a Slack message to channels or users who want to receive alerts

---
title: Mixpanel Integration
slug: mixpanel-integration
createdAt: 2021-09-13T23:57:09.000Z
updatedAt: 2021-12-03T23:56:06.000Z
---

We've made it easy to use Mixpanel with Highlight. If you don't already have Mixpanel initialized in your app, you can have Highlight initialize it for you by specifying your Mixpanel Project Token in the config.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    mixpanel: {
      projectToken: '<MIXPANEL_PROJECT_TOKEN>',
    },
  },
})
```

Whenever you call [`H.track()`](../../sdk/client.md#Htrack) or [`H.identify()`](../../sdk/client.md#Hinit) it will forward that data to Mixpanel's `track` and `identify` calls. If you want to disable this behavior, you can set `enabled: false` for the integration:

```typescript
H.init('<YOUR_PROJECT_ID>', {
  integrations: {
    mixpanel: {
      enabled: false,
    },
  },
})
```

## API

### `track()`

Calling [`H.track()`](../../sdk/client.md#Htrack) will forward the data to Mixpanel's `track()`. Highlight will also add a Mixpanel property called `highlightSessionURL` which contains the URL to the Highlight session where the track event happened.

### `identify()`

Calling [`H.identify()`](../../sdk/client.md#Hidentify) will forward the data to Mixpanel's `identify()`.

---
title: Integrations Overview
slug: integrations
createdAt: 2021-09-14T02:03:51.000Z
updatedAt: 2022-09-08T21:45:54.000Z
---

Read more about highlight.io's integrations! Have a questions or want to request a new integration? Hit us up in our [community](https://highlight.io/community).

<DocsCardGroup>
    <DocsCard title="Amplitude."  href="./amplitude-integration.md">
        {"Instrument highlight.io to send amplitude events."}
    </DocsCard>
    <DocsCard title="Mixpanel."  href="./mixpanel-integration.md">
        {"Instrument highlight.io to send mixpanel events."}
    </DocsCard>
    <DocsCard title="Clickup."  href="./clickup-integration.md">
        {"Create clickup tickets within highlight.io"}
    </DocsCard>
    <DocsCard title="Front."   href="./front-integration.md">
        {"View highlight.io sessions directly in your front inbox."}
    </DocsCard>
    <DocsCard title="Linear."  href="./linear-integration.md">
        {"Create linear tickets within highlight.io"}
    </DocsCard>
    <DocsCard title="GitHub."  href="./github-integration.md">
        {"Create GitHub Issues within highlight.io"}
    </DocsCard>
    <DocsCard title="Segment."  href="./segment-integration.md">
        {"Instrument highlight.io to send segment events."}
    </DocsCard>
    <DocsCard title="Height."  href="./height-integration.md">
        {"Create height tickets within highlight.io"}
    </DocsCard>
    <DocsCard title="Jira."  href="./jira-integration.md">
        {"Create Jira tasks within highlight.io"}
    </DocsCard>
    <DocsCard title="Intercom."  href="./intercom-integration.md">
        {"Access highlight.io sessions within your intercom dashboard."}
    </DocsCard>
    <DocsCard title="Slack."   href="./slack-integration.md">
        {"Send highlight.io alerts to slack."}
    </DocsCard>
    <DocsCard title="Vercel."  href="./vercel-integration.md">
        {"Automate uploading of sourcemaps and integration"}
    </DocsCard>
    <DocsCard title="Discord."  href="./discord-integration.md">
        {"Create discord tickets within highlight.io"}
    </DocsCard>
    <DocsCard title="Pendo."  href="./pendo-integration.md">
        {"Instrument highlight.io to send pendo events."}
    </DocsCard>
</DocsCardGroup>

---
title: Highlight Docs
slug: docs
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

---
title: Welcome to highlight.io
slug: welcome-to-highlight
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2022-08-18T22:36:12.000Z
---

[highlight.io](https://highlight.io) is monitoring software for the next generation of developers. And it's all [open source](https://github.com/highlight/highlight) :).

[highlight.io](https://highlight.io) gives you **fullstack** visibility into your application by pairing session replay, error monitoring, and logging, allowing you to tie frontend issues with backend logs and performance issues.

When highlight.io is fully integrated, this is what it looks like:

<EmbeddedVideo 
  src="https://www.youtube.com/embed/EvGsmbt0F7s"
  title="Youtube Video Player"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

And to get started:

<DocsCardGroup>
    <DocsCard title="Get Started" href="../getting-started/1_overview.md">
        {"Get started with highlight.io. Instrument your frontend & backend."}
    </DocsCard>
</DocsCardGroup>

### About us

<DocsCardGroup>
    <DocsCard title="Mission & Values." href="./2_company/1_values.md">
        {"Details about our company, our values, and open source."}
    </DocsCard>
    <DocsCard title="Compliance & Security."  href="./2_company/compliance-and-security.md">
        {"Our security certificates, and contact details."}
    </DocsCard>
    <DocsCard title="Contributing to highlight.io"  href="./2_company/open-source/contributing.md">
        {"Open source, self hosting highlight, and contributing."}
    </DocsCard>
    <DocsCard title="Self hosting highlight.io"  href="./4_company/open-source/hosting/2_self-host-hobby.md">
        {"Open source, self hosting highlight, and contributing."}
    </DocsCard>
</DocsCardGroup>

### Features

<DocsCardGroup>
    <DocsCard title="Session Replay." href="./6_product-features/1_session-replay/1_overview.md">
        {"Session replay features, how to get started, etc.."}
    </DocsCard>
    <DocsCard title="Error Monitoring."  href="./6_product-features/2_error-monitoring/1_overview.md">
        {"Error monitoring features, how to get started, etc.."}
    </DocsCard>
    <DocsCard title="Logging."  href="./6_product-features/4_logging/1_overview.md">
        {"Logging features, how to get started, etc.."}
    </DocsCard>
</DocsCardGroup>

---
title: chi
slug: chi
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["chi"]}/>

---
title: echo
slug: echo
createdAt: 2023-08-18T03:39:00.000Z
updatedAt: 2023-08-18T03:39:00.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["echo"]}/>

---
title: fiber
slug: fiber
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["fiber"]}/>

---
title: gin
slug: gin
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["gin"]}/>

---
title: gqlgen
slug: gqlgen
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["gqlgen"]}/>

---
title: Go
slug: go
---

---
title: gorilla mux
slug: mux
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["go"]["mux"]}/>

---
heading: Error Monitoring in Go
title: Error Monitoring in Go
slug: go
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

<MissingFrameworkCopy/>

<DocsCardGroup>
    <DocsCard title="Go Chi" href="../go/chi">
        {"Get started with Go Chi"}
    </DocsCard>
    <DocsCard title="Go Fiber" href="../go/fiber">
        {"Get started with Go Fiber"}
    </DocsCard>
    <DocsCard title="Go Gin" href="../go/gin">
        {"Get started with Go Gin"}
    </DocsCard>
    <DocsCard title="Go Gqlgen" href="../go/gqlgen">
        {"Get started with Go Gqlgen"}
    </DocsCard>
    <DocsCard title="Go Mux" href="../go/mux">
        {"Get started with Go Mux"}
    </DocsCard>
</DocsCardGroup>

---
title: Google Cloud Functions Functions
heading: Using highlight.io with Python on Google Cloud Functions
slug: google-cloud-functions
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["google-cloud-functions"]}/>

---
title: Python
slug: python
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

---
title: AWS Lambda Python
heading: Using highlight.io with Python on AWS Lambda
slug: aws-lambda-python
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["aws-lambda-python"]}/>

---
title: Django
heading: Using highlight.io with Python Django
slug: django
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["django"]}/>

---
title: Python App
heading: Using highlight.io with Other Python Frameworks
slug: other
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["other"]}/>

---
title: Azure Functions
heading: Using highlight.io with Python on Azure Functions
slug: azure-functions
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["azure-functions"]}/>

---
title: FastAPI
heading: Using highlight.io with Python FastAPI
slug: fastapi
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["fastapi"]}/>

---
heading: Error Monitoring in Python
title: Error Monitoring in Python
slug: python
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

<MissingFrameworkCopy/>

<DocsCardGroup>
    <DocsCard title="AWS Lambda" href="../python/aws-lambda">
        {"Get started in your AWS Lambda"}
    </DocsCard>
    <DocsCard title="Azure Functions" href="../python/azure-functions">
        {"Get started in Azure"}
    </DocsCard>
    <DocsCard title="Django" href="../python/django">
        {"Get started in Django"}
    </DocsCard>
    <DocsCard title="FastAPI" href="../python/fastapi">
        {"Get started in FastAPI"}
    </DocsCard>
    <DocsCard title="Flask" href="../python/flask">
        {"Get started in Flask"}
    </DocsCard>
    <DocsCard title="Google Cloud Functions" href="../python/google-cloud-functions">
        {"Get started in GCP"}
    </DocsCard>
    <DocsCard title="Other" href="../python/other">
        {"Get started without a framework"}
    </DocsCard>
</DocsCardGroup>

---
title: Flask
heading: Using highlight.io with Python Flask
slug: flask
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["python"]["flask"]}/>

---
title: Firebase
slug: firebase
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["firebase"]}/>

---
title: tRPC
slug: trpc
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["trpc"]}/>

---
title: Express.js
slug: express
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["express"]}/>

---
title: Apollo Server
slug: apollo
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["apollo"]}/>

---
title: JS
slug: js
---

---
title: AWS Lambda Node.JS
slug: aws-lambda-node
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["aws-lambda-node"]}/>

---
title: Cloudflare Workers
slug: cloudflare
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["cloudflare"]}/>

---
title: Nest.js
slug: nestjs
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["nestjs"]}/>

---
title: Node.js
slug: nodejs
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["js"]["nodejs"]}/>

---
heading: Error Monitoring in Javascript / Typescript
title: Error Monitoring in Javascript / Typescript
slug: go
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

<MissingFrameworkCopy/>

<DocsCardGroup>
    <DocsCard title="Apollo Server" href="../js/apollo">
        {"Get started with Apollo Server"}
    </DocsCard>
    <DocsCard title="Cloudflare Workers" href="../js/cloudflare">
        {"Get started with Cloudflare Workers"}
    </DocsCard>
    <DocsCard title="Express.js" href="../js/express">
        {"Get started with Express.js"}
    </DocsCard>
    <DocsCard title="Firebase Functions" href="../js/firebase">
        {"Get started with Firebase Functions"}
    </DocsCard>
    <DocsCard title="Next.js" href="../../fullstack-frameworks/next-js">
        {"Get started with Next.js"}
    </DocsCard>
    <DocsCard title="Node.js" href="../js/nodejs">
        {"Get started with Node.js"}
    </DocsCard>
    <DocsCard title="tRPC" href="../js/trpc">
        {"Get started with tRPC"}
    </DocsCard>
</DocsCardGroup>

---
title: Java
slug: Java
createdAt: 2023-05-41T21:51:15.000Z
updatedAt: 2023-05-41T21:51:54.000Z
---

---
title: Java App
heading: Using highlight.io with Other Java Frameworks
slug: other
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["java"]["other"]}/>

---
heading: Error Monitoring in Java
title: Error Monitoring in Java
slug: java
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---


<MissingFrameworkCopy/>

<DocsCardGroup>
    <DocsCard title="Other" href="../java/other">
        {"Get started without a framework"}
    </DocsCard>
</DocsCardGroup>

---
title: 'Backend: Error Monitoring'
slug: 4_backend-sdk
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

---
title: Rails
heading: Using highlight.io with Ruby on Rails
slug: rails
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["ruby"]["rails"]}/>

---
title: Ruby
slug: ruby
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

---
title: Ruby App
heading: Using highlight.io with Other Ruby Frameworks
slug: other
quickstart: true
---

<QuickStart content={quickStartContent["backend"]["ruby"]["other"]}/>

---
heading: Error Monitoring in Ruby
title: Error Monitoring in Ruby
slug: ruby
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---


<MissingFrameworkCopy/>

<DocsCardGroup>
    <DocsCard title="Rails" href="../ruby/rails">
        {"Get started in Rails"}
    </DocsCard>
    <DocsCard title="Other" href="../ruby/other">
        {"Get started without a framework"}
    </DocsCard>
</DocsCardGroup>

---
title: Development deployment guide.
slug: welcome-to-highlight
quickstart: true
---

<QuickStart content={quickStartContent["other"]["dev-deploy"]}/>

---
title: Hobby deployment guide.
slug: welcome-to-highlight
quickstart: true
---

<QuickStart content={quickStartContent["other"]["self-host"]}/>

---
title: Self Host & Local Dev
slug: self-host
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

---
headline: Self Host & Local Development
title: Overview
slug: self-host
---

## Self-hosted Hobby Guide

Looking to deploy the self-hosted hobby deployment of highlight.io? Checkout this guide:

<DocsCardGroup>
    <DocsCard title="Self-hosted Hobby Guide." href="./self-hosted-hobby-guide.md">
        {"Self hosting the hobby docker deployment of highlight.io"}
    </DocsCard>
</DocsCardGroup>

## Development Deployment Guide

Looking to contribute to highlight.io? Checkout out guide on deploying highlight.io in docker for development. This includes specific flags to support local filesystem mounts, hot reloading, etc..

<DocsCardGroup>
    <DocsCard title="Dev Deployment Guide." href="./dev-deployment-guide.md">
        {"Running a docker version of highlight.io for development."}
    </DocsCard>
</DocsCardGroup>

---
title: React.js
heading: Using highlight.io with React.js
slug: react
quickstart: react
---

<QuickStart content={quickStartContent["client"]["js"]["react"]}/>

---
title: Angular
heading: Using highlight.io with Angular
slug: angular
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["angular"]}/>

---
title: SvelteKit
heading: Using highlight.io with SvelteKit
slug: svelte-kit
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["svelte-kit"]}/>

---
title: Vue.js
slug: vuejs
headline: Using highlight.io in Vue.js
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["vue"]}/>

---
title: Remix
slug: remix
heading: Using highlight.io with Remix
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["remix"]}/>

---
title: Other
heading: Using highlight.io in any frontend framework
slug: other
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["other"]}/>

---
title: Frontend
slug: client-sdk
createdAt: 2022-04-01T19:38:31.000Z
updatedAt: 2022-05-26T18:53:53.000Z
---

---
title: Gatsby.js
heading: Using highlight.io with Gatsby
slug: gatsbyjs
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["gatsby"]}/>

---
title: Next.js Quick Start
slug: nextjs
heading: Next.js Quick Start
quickstart: true
---

<QuickStart content={quickStartContent["client"]["js"]["next"]}/>

---
title: Proxying Highlight
slug: proxying-highlight
createdAt: 2021-10-11T21:13:07.000Z
updatedAt: 2022-01-27T19:51:23.000Z
---

```hint
Proxying is only available on an Annual Plan. If you would like use this, you will need to reach out to sales@highlight.io.


```

If you're not seeing sessions or errors on Highlight, chances are that requests to Highlight are being blocked. This can happen for different reasons such as a third-party browser extensions, browser configuration, or VPN settings.

One way we can avoid this is by setting up proxy from your domain to Highlight. To do this, you will need access to your domain's DNS settings.

## Setting up the proxy

1.  On your domain, add a `CNAME` record that points `highlight.<YOUR_DOMAIN>` to `pub.highlight.run`.

2.  Send us an email at sales@highlight.io so we can send over a cost proposal for your annual usage.


Below is an example email/message that you can send over.

> Hello!
>
> I'd like to use the Highlight Proxy and I'm interested in an annual plan. I've set up an CNAME record for: highlight.piedpiper.com

### Example

You have an app running on `https://piedpiper.com`. Your DNS record will point `highlight.piedpiper.com` to our backend.

## Using the Proxy

In your app where you call [H.init()](../../../sdk/client.md#Hinit), you will need to set `backendUrl` to the DNS record you just created. For the example above:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  backendUrl: 'https://highlight.piedpiper.com',
})
```

You should now see Highlight making requests to `https://highlight.piedpiper.com` instead of `https://pub.highlight.run`.

---
title: iframe Recording
slug: iframe-recording
createdAt: 2022-04-14T16:12:23.000Z
updatedAt: 2022-04-19T18:48:07.000Z
---

## Recording within `iframe` elements

- Highlight will recreate an `iframe` with the same src. The `iframe` will not load if the src's origin has a restrictive X-Frame-Options header.

- Highlight only supports recording same-origin iframes because of browsers' same-origin policy. If it's possible to init Highlight within the
  `iframe `, you can record the events within as a separate session in your same project.

- If your
  `iframe ` source becomes invalid after some time or will not render content when inserted in a different domain or website, the recording will not show the correct content that the user saw.

![rendering in a session replay](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/UP4LVunHyPBCzRukQwoh4_image.png)

## Recording a cross-origin `iframe` element

[Cross-origin iframes](https://learn.microsoft.com/en-us/skype-sdk/ucwa/cross_domainiframe) are `<iframe>` elements in your app that reference a domain considered to be of a [different origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). When your iframe uses a `src` tag pointing to a different origin, the iframe is not accessible from the parent page. However, the iframe can still emit messages that the parent page can hear.

To support cross-origin iframes, we added functionality into our recording client that allows the iframe to forward its events to the parent session. All you need to do is add the Highlight snippet to **both** the parent window and the iframe.

Ensure you are using [highlight.run](https://www.npmjs.com/package/highlight.run) 7.1.0 or newer. Then, set the following option on both of the `H.init` calls: in the parent window and in the iframe.

```typescript
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  recordCrossOriginIframe: true,
})
```

Ensure that you add the `H.init` call to both the parent page and the iframe page, and that you've set `recordCrossOriginIframe` **in both H.init calls**.

---
title: Upgrading Highlight
slug: upgrading-highlight
createdAt: 2021-09-14T00:13:12.000Z
updatedAt: 2022-03-08T00:55:27.000Z
---

Highlight is shipping improvements multiple times a day. Non-breaking changes will automatically be applied to your applications without any action needed by you.

If Highlight ships a breaking change (new feature, security fix, etc.), we'll need your help to upgrade Highlight in your application. We aim to give 2 weeks notice in the event this happens. We recognize that there will be clients still using older versions of Highlight so we make sure all of our changes are backwards compatible.

## Using a Package Manager

```shell
# with npm
npm install highlight.run@latest
```

```shell
# with yarn
yarn upgrade highlight.run@latest
```

## HTML/CDN

Replace the Highlight snippet in your `index.html` with the one on [https://app.highlight.io/setup](https://app.highlight.io/setup).

## Changelog

To see if a new version has any breaking changes, see [Changelog](https://highlight.canny.io/changelog).

---
title: Recording WebSocket Events
slug: recording-web-socket-events
createdAt: 2023-07-17T12:38:18.987Z
updatedAt: 2023-07-17T13:31:16.988Z
---

Highlight also allows you to record all of your WebSocket events in your sessions. It will display WebSocket events, such as opening a connection, sending and receiving messages, receiving an error, and closing a connection.

Enabled this feature by setting `networkRecording.recordHeadersAndBody` (see [NetworkRecordingOptions](../../../sdk/client.md#Hinit)) to `true` when initializing Highlight. If you want to disable WebSocket events, but keep recording the headers and bodies of network requests, you can set `networkRecording.disableWebSocketEventRecordings` to `true`.

Highlight monkey patches the `WebSocket` object to add event listeners to the respective methods when the WebSocket is initialized.

## Recording WebSocket Events

Highlight can also record WebSocket events. WebSockets will display the initial open connection with the other network requests in the session Developer Tools. The WebSocket request can be clicked on to view the related messages and events.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
})
```

## Disabling WebSocket Events

WebSocket event recording can be disabled without affecting the other network requests by setting `networkRecording.disableWebSocketEventRecordings` to `true`.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    disableWebSocketEventRecordings: true
  },
})
```

## API

See [NetworkRecordingOptions](../../../sdk/client.md) for more information on how to configure network recording.

WebSocket event recording is only available for `highlight.run` versions newer than `7.3.0`.
---
title: Troubleshooting
slug: troubleshooting
createdAt: 2022-01-20T23:35:49.000Z
updatedAt: 2022-01-20T23:42:57.000Z
---

## Why do some parts of the session appear blank?

• For images, videos, and other external assets, Highlight does not make a copy at record time. At replay time, we make a request for the asset. If a request fails, the most common reason is because of authorization failure, the asset no longer existing, or the host server has a restrictive CORS policy

• For iFrames, Highlight will recreate an iframe with the same `src`. The iFrame will not load if the `src`'s origin has a restrictive `X-Frame-Options` header.

• For canvas/WebGL, see [WebGL](./canvas.md) to enable recording

## Why are the correct fonts not being used?

• During a replay, Highlight will make a request for the font file on your server. In the case where the request fails, Highlight will use your fallback font. The most common reason for failing is because your have a restrictive CORS policy for `Access-Control-Origin`. To allow Highlight to access the font files, you'll need to add `app.highlight.io`.

---
title: Recording Network Requests and Responses
slug: recording-network-requests-and-responses
createdAt: 2021-09-14T00:14:21.000Z
updatedAt: 2023-10-25T15:40:08.873Z
---

Highlight out of the box shows you all the network requests durations, response codes, and sizes for a session. If you'd like more data such as the headers and bodies, you can enable recording of network requests and responses by setting `networkRecording.recordHeadersAndBody` (see [NetworkRecordingOptions](../../../sdk/client.md#Hinit)) to `true` when initializing Highlight.

Highlight monkey patches `XmlHttpRequest` and `fetch` to record data from your app's requests/responses including status codes, headers, and bodies.

## Privacy

Out of the box, Highlight will not record known headers that contain secrets. Those headers are:
\- `Authorization`
\- `Cookie`
\- `Proxy-Authorization`

If you have other headers that you would like to redact then you can set `networkRecording.networkHeadersToRedact`.

## Recording Headers and Bodies

Highlight can also record the request/response headers and bodies. You'll be able to see the headers and bodies by clicking on any XHR or Fetch requests in the session Developer Tools.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
})
```

## Redacting URLs

You may have APIs that you know will always return secrets in the headers, body, or both. In this case, you can choose URLs to redact from. If a URL matches one of the URLs you specify, the header and body will not be recorded.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: true,
  urlBlocklist: [
    'https://salted-passwords.com',
    'https://www.googleapis.com/identitytoolkit',
    'https://securetoken.googleapis.com',
  ],
})
```

Out of the box, Highlight will not record these URLs:
\- `https://www.googleapis.com/identitytoolkit`
\- `https://securetoken.googleapis.com`

## Redacting Headers and Bodies

If you are dealing with sensitive data or want to go the allowlist approach then you can configure `networkRecording.headerKeysToRecord` and `networkRecording.bodyKeysToRecord`. Using these 2 configs, you'll be able to explicitly define which header/body keys to record.

You can also redact specific headers by using `networkRecording.networkHeadersToRedact` and redact specific keys in the request/response body with `networkRecoding.networkBodyKeysToRedact`.

This configuration is only available for `highlight.run` versions newer than `4.1.0`.

## Custom Sanitizing of Response and Requests

Create a sanitize function to gain granular control of the data that your client sends to Highlight. The sanitize function is defined in the second argument of `H.init` under `networkRecording.requestResponseSanitizer`.

The `networkRecording.requestResponseSanitizer` method receives a Request/Response pair, and should return an object of the same type or a `null` value. Returning a `null` value means that Highlight will drop the request, and no related network logs will be seen in the session replay.

Dropping logs is not recommended unless necessary, as it can cause issues with debugging due to the missing requests. Rather, it is recommended to delete or redact header and body fields in this method.

This configuration is only available for `highlight.run` versions newer than `8.1.0`.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    requestResponseSanitizer: (pair) => {
      if (pair.request.url.toLowerCase().indexOf('ignore') !== -1) {
        // ignore the entire request/response pair (no network logs)
        return null
      }
	 
      if (pair.response.body.indexOf('secret') !== -1) {
        // remove the body in the response
        delete pair.response.body;
      }
	 
      return pair
    }
  },
})
```

## API

See [NetworkRecordingOptions](../../../sdk/client.md) for more information on how to configure network recording.

## GraphQL

We extract GraphQL operation names and format the payloads. See [GraphQL details](../../../general/6_product-features/1_session-replay/graphql.md).

---
title: Console Messages
slug: console-messages
createdAt: 2021-09-14T01:47:28.000Z
updatedAt: 2022-08-11T16:28:21.000Z
---

Highlight out of the box shows you the console messages that were logged during a session.

```hint
Console messages are not recorded on `localhost` because Highlight emits debug messages which we prefer not to flood your environment with.
```

## Configuration

- Disabling console recording can be configured with `disableConsoleRecording`.

- You can specify which console methods to record with `consoleMethodsToRecord`.

See [H.init()](../../../sdk/client.md#Hinit) for more information.

---
title: Privacy
slug: privacy
createdAt: 2021-09-14T17:47:33.000Z
updatedAt: 2022-08-03T23:29:08.000Z
---

## Masking Elements

One way to sanitize your recordings is by adding the `highlight-block` CSS class to elements that should be ignored.

```html
<div class="highlight-block">Super secret sauce</div>
```

The Highlight snippet will in-turn measure the dimensions of the ignored element, and when the recording is being replayed, an empty placeholder will replace the content.

![](/images/redaction.gif)

## Obfuscating Elements

Alternatively, you can obfuscate specific HTML elements by adding the `highlight-mask` CSS class. The effect is the same of setting `privacySetting: 'strict'` (the randomized text in the photo above) but applies to the specific HTML element that you mask.

```html
<div class="highlight-mask">This is some sensitive data <button>Important Button</button></div>
```

## Ignoring Input

```hint
The following CSS class only works for `<input>` elements. If you are interested in blocking the capture of other HTML elements, see the `highlight-block` class
```

For sensitive input fields that your team would like to ignore user input for, you can add a CSS class `highlight-ignore` that will preserve the styling of the input element, but ignore all user input.

```html
<input class="highlight-ignore" name="social security number" />
```

## Network Request Redaction
Interested in redacting particular requests, responses, or the data within them? Highlight will redact certain headers out of the box, but provides a few ways to customize the redaction process to suit your specific needs and preferences. Take a look at our documentation on [Recording Network Requests and Responses](./recording-network-requests-and-responses.md) to learn more.

## Default Privacy Mode

By default, Highlight will obfuscate any text or input data that matches commonly used Regex expressions and input names of personally identifiable information. This offers a base level protection from recording info such as addresses, phone numbers, social security numbers, and more. It will not obfuscate any images or media content. It is possible that other, non PII text is obfuscated if it matches the expressions for larger number, or contact information on the site. If you want to turn this off, you can set `privacySetting` to `none` when calling [`H.init()`](../../../sdk/client.md#Hinit).

Note: This mode is only available in SDK versions 8.0.0 and later.

Here are a list of the [regex expressions used in default privacy mode](https://github.com/highlight/rrweb/blob/e6a375a554dac9de984a18bfb8ba6e3beb4bd961/packages/rrweb-snapshot/src/utils.ts#L267-L295):
```
Email: "[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*"
SSN: '[0-9]{3}-?[0-9]{2}-?[0-9]{4}'
Phone number: '[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}'
Credit card: '[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}'
Unformatted SSN, phone number, credit card: '[0-9]{9,16}'
Address: '[0-9]{1,5}.?[0-9]{0,3}s[a-zA-Z]{2,30}s[a-zA-Z]{2,15}'
IP address: '(?:[0-9]{1,3}.){3}[0-9]{1,3}'
```

## Strict Privacy Mode

If you don't want to manually annotate what elements to not record then you can set `privacySetting` to `strict` when calling [`H.init()`](../../../sdk/client.md#Hinit). Strict Privacy Mode will obfuscate all text and images. The text obfuscation is not reversible and is done on the client.

Here are some examples:

- `<h1>Hello World</h1>` will be recorded as `<h1>1f0eqo jw02d</h1>`

- `<img src="https://my-secrets.com/secret.png" />` will be recorded as `<img src="" />`

```html
<iframe
  height="500px"
  href="https://xenodochial-benz-c14354.netlify.app/"
  width="100%"
  border="none"
  src="https://xenodochial-benz-c14354.netlify.app/"
  style="border:none"
  ><a href="https://xenodochial-benz-c14354.netlify.app/" target="" title="xenodochial-benz-c14354.netlify.app"
    >null</a
  ></iframe
>
```



---
title: Canvas & WebGL
slug: canvas
createdAt: 2021-10-13T22:55:19.000Z
updatedAt: 2022-09-29T18:01:58.000Z
---
<br/>

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>
## Canvas Recording

Highlight can record the contents of `<canvas>` elements, with support for 2D and 3D contexts. Canvas recording can be enabled and configured via the `H.init` options, set up depending on the type of HTML5 Canvas application you are building. For example, a video game WebGL application or three.js visualization may require a higher snapshotting framerate to ensure the replay has enough frames to understand what was happening.

Enable canvas recording by configuring [H.init()](../../../sdk/client.md#Hinit) in the following way:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableCanvasRecording: true,        // enable canvas recording
  samplingStrategy: {
    canvas: 2,                        // snapshot at 2 fps
    canvasMaxSnapshotDimension: 480,  // snapshot at a max 480p resolution
  },
})
```

With these settings, the canvas is serialized as a 480p video at 2FPS.

`samplingStrategy.canvas` is the frame per second rate used to record the HTML canvas. A value < 5 is recommended to ensure the recording is not too large and does not have issues with playback.

`samplingStrategy.canvasManualSnapshot` is the frame per second rate used in manual snapshotting mode. See `Manual Snapshotting` below.

`samplingStrategy.canvasFactor`: a resolution scaling factor applied to both dimensions of the canvas.

`samplingStrategy.canvasMaxSnapshotDimension`: max recording resolution of the largest dimension of the canvas.

`samplingStrategy.canvasClearWebGLBuffer`: (advanced) set to false to disable webgl buffer clearing (if the canvas flickers when recording).

`samplingStrategy.canvasInitialSnapshotDelay`: (advanced) time (in milliseconds) to wait before the initial snapshot of canvas/video elements.

```hint
[Privacy](../../../general/6_product-features/1_session-replay/privacy.md) controls do not apply to canvas recording at this time.
```

Enabling canvas recording should not have any impact on the performance your application. We've recently changed our uploading client to use browser web-workers to ensure that data serialization cannot block the rendering of your application. If you run into any issues please [let us know](https://highlight.io/community)!

## WebGL Recording

Highlight is able to record websites that use WebGL in the `<canvas>` element. 

To enable WebGL recording, enable canvas recording by following the steps above.

```hint
If you use WebGL(2) and fail to see a canvas recorded or see a transparent image, setup manual snapshotting.
```

## Manual Snapshotting

A canvas may fail to be recorded (recorded as a transparent image) because of WebGL 
double buffering. The canvas is not accessible from the javascript thread because it may
no longer be loaded in memory, despite being rendered by the GPU (see this [chrome bug report](https://bugs.chromium.org/p/chromium/issues/detail?id=838108) for additional context). 

Manual snapshotting hooks into your WebGL render function to call `H.snapshot(canvas)` after
you paint to the WebGL context. To set this up, pass the following options to highlight first:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableCanvasRecording: true,        // enable canvas recording
  samplingStrategy: {
      canvasManualSnapshot: 2,        // snapshot at 2 fps
    canvasMaxSnapshotDimension: 480,  // snapshot at a max 480p resolution
    // any other settings...
  },
})
```

Now, hook into your WebGL rendering code and call `H.snapshot`.
```typescript
// babylon.js
engine.runRenderLoop(() => {
    scene.render()
    H.snapshot(canvasElementRef.current)
})
```

Libraries like Three.js export an [onAfterRender](https://threejs.org/docs/#api/en/core/Object3D.onAfterRender) method that you can use to call `H.snapshot`.

## Webcam Recording and Inlining Video Resources

If you use `src=blob:` `<video>` elements in your app (for example, you are using javascript to dynamically generate a video stream) or are streaming a webcam feed to a `<video>` element, you'll need to inline the `<video>` elements for them to appear correctly in the playback. Do this by enabling the `inlineImages` setting.

```javascript
H.init('<YOUR_PROJECT_ID>', {
  ..., 
  inlineImages: true,
})
```

---
title: Identifying Users
slug: identifying-users
createdAt: 2021-09-13T23:23:20.000Z
updatedAt: 2022-07-19T21:02:40.000Z
---

To tag sessions with user-specific identifiers (name, email, etc.), you can call the [`H.identify()`](../../../sdk/client.md#Hinit)method in your app. This will automatically index your sessions so that they can be filtered by these attributes.

```typescript
H.identify('eliza@corp.com', { id: 'ajdf837dj', phone: '867-5309' })
```

## User Display Names

By default, Highlight will show the `identifier` as the user's display name on the session viewer and session feed. You can override this by setting the `highlightDisplayName` or `email` fields in the [`H.identify()`](../../../sdk/client.md#Hidentify) metadata.

## Customer User Avatars

You can replace the placeholder user avatars Highlight uses with an image that you provide. You can do this by setting the `avatar` field in the [`H.identify()`](../../../sdk/client.md#Hidentify) metadata.

The image URL usually comes from your authentication provider (Firebase, Auth0, Active Directory, etc.). You can forward that URL to Highlight.

```hint
## Saving the image

Highlight does not make a copy of the image. Highlight will render the image directly. This means the image will adhere to any authorization policies.
```

```typescript
H.identify('steven@corp.com', { avatar: 'https://<IMAGE_URL>.png' })
```

## API

See the [H.identify()](../../../sdk/client.md#Hidentify) API documentation for more information on how to use it.

## What happens before a user is identified?

All key session information is tracked regardless of whether a session is identified. Highlight will generate an identifier for a user which you can see in the session player unless you set your own by calling [H.identify()](../../../sdk/client.md#Hidentify).

When a user is identified we will attempt to **assign their information to previous sessions** from the same browser. If this happens you will see an indicator in the UI showing the data was inferred for a session and that the session was never explicitly identified.

---
title: Content-Security-Policy
slug: content-security-policy
createdAt: 2022-03-01T00:39:25.000Z
updatedAt: 2022-03-01T01:08:28.000Z
---

```hint
You should keep reading this if your application runs in an environment that enforces content security policies.
```

`Content-Security-Policy` allows you to tell the browser what and how your page can interact with third-party scripts.

Here are the policies you'll need to set to use Highlight:

#### `script-src`: `https://static.highlight.io`
This policy is to allow downloading the Highlight runtime code for session recording and error monitoring.

#### `worker-src`: `blob: https://static.highlight.io`
This policy allows our script to create a web-worker which we use to serialize the recording data without affecting the performance of your application.

#### `connect-src`: `https://pub.highlight.run`
This policy is to allow connecting with Highlight servers to send recorded session data.

Your [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) definition may look something like this:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://static.highlight.io; worker-src: blob: https://static.highlight.io; connect-src https://pub.highlight.run;"
/>
```

---
title: JS SDK Configuration
slug: home
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

---
title: Sourcemap Configuration
slug: sourcemaps
---

```hint
## Should I continue reading?

If you publicly deploy sourcemaps with your application then you do not need this guide. This guide is for applications that don't ship sourcemaps with their application.
```

When debugging an error in highlight.io, it might be useful to get a stack trace from the original file in your codebase (rather than a minified file) to help understand what is going wrong. In order to do this, highlight.io needs access to the sourcemaps from your codebase. Sourcemaps can be sent to highlight.io in your CI/CD process.

## Sending Sourcemaps to highlight.io

The highlight.io [sourcemap-uploader](https://www.npmjs.com/package/@highlight-run/sourcemap-uploader) can be used during your CI/CD process. Here's an example of using it:

```shell
#!/bin/sh

# Build the app
yarn build

# Upload sourcemaps to highlight.io
# Add --appVersion "..." if you provide a version value in your H.init call.
npx --yes @highlight-run/sourcemap-uploader upload --apiKey ${YOUR_ORG_API_KEY} --path ./build

# Delete sourcemaps to prevent them from being deployed
find build -name '*.js.map' -type f -delete

# Deploy the app
./custom-deploy-script
```

## `Sourcemap-uploader Arguments`

### `apiKey`

The API key for your project. You can find this in the [project settings](https://app.highlight.io/settings/errors#sourcemaps).

## `path`

The path that highlight.io will use to send `.map` files. The default value is `./build`.

## `appVersion`

The version of your current deployment. Please provide the same version value as the value you provide for `version` in [H.init()](../../../sdk/client.md#Hinit). This ensures that we're always using the same set of sourcemaps for your current bundle. If omitted, sourcemaps are uploaded as `unversioned` (make sure [H.init()](../../../sdk/client.md#Hinit) does not have a `version` option provided).

## Generating Sourcemaps

To use the highlight.io [sourcemap-uploader](https://www.npmjs.com/package/@highlight-run/sourcemap-uploader) , you need to be generating [sourcemaps](https://developer.chrome.com/blog/sourcemaps/) for your project. Exactly how to do this depends on your target environment and javascript configuration. Bundlers like [babel](https://babeljs.io/docs/en/options#source-map-options), [webpack](https://webpack.js.org/configuration/devtool/), [esbuild](https://esbuild.github.io/api/#sourcemap), or [rollup](https://rollupjs.org/guide/en/#outputoptions-object) all provide different ways to enable sourcemap generation. Refer to documentation for your specific bundler to generate production-ready sourcemaps or reach out if you need more help!

### Electron App Sourcemaps

Although your electron app configuration may vary, many will chose to use webpack to generate sourcemaps. Refer to the [general webpack sourcemap documentation](https://webpack.js.org/configuration/devtool/) as well as [this useful reference](https://docs.sentry.io/platforms/javascript/guides/electron/sourcemaps/generating/) to configure your build.

---
title: React.js Error Boundary
slug: reactjs-error-boundary
createdAt: 2021-09-14T02:03:51.000Z
updatedAt: 2022-09-08T21:45:54.000Z
---

Highlight ships [`@highlight-run/react`](https://github.com/highlight/react) which can be installed alongside `highlight.run` for additional functionality for React applications.

# Error Boundary

Highlight provides an `ErrorBoundary` to help you provide a better experience for your users when your application crashes. Using an `ErrorBoundary` gives your application an opportunity to recover from a bad state.

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary>
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

## Examples

### Showing the feedback modal when a crash happens

![react error boundary](/images/docs/client-sdk/replay-configuration/react-error-boundary.png)

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary>
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

### Showing a custom feedback modal when a crash happens

You should use this if you would like to replace the feedback modal with your own styles/branding.

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary
    customDialog={
      <div>
        <h2>Whoops! Looks like a crash happened.</h2>
        <p>Don't worry, our team is tracking this down!</p>

        <form>
          <label>
            Feedback
            <input type="text" />
          </label>

          <button type="submit">Send Feedback</button>
        </form>
      </div>
    }
  >
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

### Using the ErrorBoundary with react-router

If you're using react-router, you may have [error raised by your route loaders](https://reactrouter.com/en/main/route/error-element)
that can be handled with the highlight error boundary. 
To set this up, you'll need to pass your `<Route>` or your `<RouterProvider> router`
the `ErrorBoundary` prop pointing to a component that extracts the react router error from `useRouteError` and

```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	useRouteError,
} from 'react-router-dom'
import { ReportDialog } from '@highlight-run/react'
import Root from './routes/root'

function rootAction() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

function rootLoader() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

function ErrorPage() {
	const error = useRouteError() as { statusText: string; data: string }
	return (
		<ReportDialog error={new Error(`${error.statusText}: ${error.data}`)} />
	)
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route
			path="/"
			element={<Root />}
			loader={rootLoader}
			action={rootAction}
			ErrorBoundary={ErrorPage}
		>
			<Route>
				<Route index element={<Root />} />
			</Route>
		</Route>,
	),
)

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
```

## ErrorBoundary API

### `fallback`

A fallback component that gets rendered when the error boundary encounters an error.

## `showDialog`

Enables Highlight's crash report. When the `ErrorBoundary` is triggered, a form will be prompted to the user asking them for optional feedback. Defaults to true.

### `dialogOptions`

The strings used for the Highlight crash report.

`user`

Allows you to attach additional user information to the feedback report. If you've called [`H.identify()`](../../../sdk/client.md) in your application before, you won't have to set this, Highlight will infer the user's identity.

`title`

The title for the report dialog.

`subtitle`

The subtitle for the report dialog.

`subtitle2`

The secondary subtitle for the report dialog.

`labelName`

The label for the name field.

`labelEmail`

The label for the email field.

`labelComments`

The label for the verbatim field.

`labelClose`

The label for the close button.

`labelSubmit`

The label for the submit button.

`successMessage`

The label for the success message shown after the crash report is submitted.

`hideHighlightBranding`

Whether to show the Highlight branding attribution in the report dialog.

Default value is `false`.

---
title: Versioning Sessions & Errors
slug: versioning-sessions
createdAt: 2021-09-14T00:14:40.000Z
updatedAt: 2022-03-21T18:25:40.000Z
---

When using [highlight.io](https://highlight.io), it can be useful to know which version of your app a session or error is recorded on. [highlight.io](https://highlight.io) helps you by letting you tag which app version a session and error was recorded on.

To tag your sessions with a version, you can set the `version` field in [`H.init()`](../../../sdk/client.md#Hinit).

```typescript
import App from './App'
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  version: process.env.REACT_APP_VERSION,
})

ReactDOM.render(<App />, document.getElementById('root'))
```

Once setup, this version will then be rendered on both the error and session views.

---
title: Client SDK Changelog
slug: client-changelog
createdAt: 2022-11-01T21:15:18.000Z
updatedAt: 2022-11-01T21:15:18.000Z
---

---
title: SDK Configuration Overview
slug: welcome-to-highlight
---

Check out our [Github repo SDKs](https://github.com/highlight/highlight/tree/main/sdk) to see individual SDK changelogs.

---
title: Tracking Events
slug: tracking-events
createdAt: 2021-09-13T23:23:28.000Z
updatedAt: 2022-03-21T18:25:39.000Z
---

A track event is a named event that you've defined. Adding a track event is useful if you want to be able to be alerted (see [alerts](../../../general/6_product-features/3_general-features/alerts.md)) or [search for sessions](../../../general/6_product-features/1_session-replay/session-search.md#track-searching) where the user has done an action.

## Example Scenario: A Shopping Cart

You'd like to see what users are doing that cause them to open the shopping cart. In your app, you'll add `H.track()`:

```javascript
import { H } from 'highlight.run';
import { getSubtotal } from '@utils';

const ShoppingCard = ({ items }) => (
    <Button
        onClick={() => {
            H.track("Shopping Cart Opened", {
                subtotal: getSubtotal(items),
                numberOfItems: items.length
            });
        }}
    >
        Shopping Cart
    </Button>
)
```

## API

See the [Recording Network Requests and Responses](../../../sdk/client.md#Htrack) API documentation for more information on how to use it.

---
title: Monkey Patches
slug: monkey-patches
createdAt: 2022-01-21T22:53:59.000Z
updatedAt: 2022-01-21T23:09:14.000Z
---

All the data that Highlight collects is provided by running the Highlight snippet on your app. When the Highlight snippet runs, it monkey patches browser APIs in order to record things like:

- Errors

- Console messages

- Network requests

- Changes on the page

Here is a list of all the browser APIs that Highlight monkey patches

- `window.sessionStorage.setItem`

- `window.sessionStorage.getItem`

- `window.sessionStorage.removeItem`

- `window.onerror`

- `window.fetch`

- `window.FontFace`

- `window.scroll`

- `window.scrollTo`

- `window.scrollBy`

- `window.scrollIntoView`

- `window.WebGLRenderingContext`

- `window.WebGL2RenderingContext`

- `window.CanvasRenderingContext2D`

- `window.HTMLCanvasElement`

- `window.CSSStyleSheet.prototype.insertRule`

- `window.CSSStyleSheet.prototype.deleteRule`

- `window.CSSGroupingRule`

- `window.CSSMediaRule`

- `window.CSSConditionRule`

- `window.CSSSuportsRule`

- `window.CSSStyleDeclaration.prototype.setProperty`

- `window.CSSStyleDeclaration.prototype.removeProperty`

- `history.pushState`

- `history.replaceState`

- `XMLHttpRequest.prototype.open`

- `XMLHttpRequest.prototype.setRequestHeader`

- `XMLHttpRequest.prototype.send`

- `console.assert`

- `console.clear`

- `console.count`

- `console.countReset`

- `console.debug`

- `console.dir`

- `console.dirxml`

- `console.error`

- `console.group`

- `console.groupCollapsed`

- `console.groupEnd`

- `console.info`

- `console.log`

- `console.table`

- `console.time`

- `console.timeEnd`

- `console.timeLog`

- `console.trace`

- `console.warn`

---
title: Persistent Asset Storage
slug: persistent-assets
createdAt: 2021-10-13T22:55:19.000Z
updatedAt: 2022-09-29T18:01:58.000Z
---

## Persistent Asset Storage

When Highlight records your HTML DOM, media assets including fonts, stylesheets, videos, and images are referenced by their original source URL.
This means that playing a session after it was recorded may lead to discrepancies in the replay if any of the assets change.

For example, consider the following HTML element
```html
<video
    preload="metadata"
    autoPlay={true}
    crossOrigin="anonymous"
    src="https://static.highlight.io/dev/BigBuckBunny.mp4"
></video>
```

When a session is recorded, we will record this element as is, storing the video playback time and any seek events as they happen.
If the contents of https://static.highlight.io/dev/BigBuckBunny.mp4 change after the session is recorded, the playback
will be inconsistent with what a user actually saw, since the video file will differ.

To ensure pixel-perfect replay, we have an **Enterprise tier** feature to persist these assets alongside our secure session storage.
With this feature enabled, the replay will render this element as
```html
<video
    preload="metadata"
    autoPlay={true}
    crossOrigin="anonymous"
    src="https://pri.highlight.io/assets/1/bxvdqlD_55hvnUuAo-NTiyiLOqeobyMatWjgmLFZhH0~"
></video>
```
where https://pri.highlight.io/assets/1/bxvdqlD_55hvnUuAo-NTiyiLOqeobyMatWjgmLFZhH0~ will be the video file saved at the time of the recording.
The asset will be persisted as long as your session is retained.

[Upgrade your plan](https://www.highlight.io/pricing) and  [reach out to us to enable the feature](https://highlight.io/community)!

---
title: SDK Configuration Overview
slug: welcome-to-highlight
---

The [highlight.io](https://highlight.io) Javascript SDK does a lot of things. Here's some docs on how to configure it to do what you want.

<DocsCardGroup>
    <DocsCard title="Canvas Recording." href="./canvas.md">
        {"How to enable/disable canvas recording in our client SDK."}
    </DocsCard>
    <DocsCard title="Console Messages."  href="./console-messages.md">
        {"How to enable/disable console message recording in our client SDK."}
    </DocsCard>
    <DocsCard title="Content Security Policy."  href="./content-security-policy.md">
        {"Configuring your CSP to play well with highlight.io."}
    </DocsCard>
    <DocsCard title="Identifying Users."  href="./identifying-sessions.md">
        {"Identifying visitors on your web application."}
    </DocsCard>
    <DocsCard title="Iframe Support."  href="./iframes.md">
        {"How to record a highlight.io session within an iframe."}
    </DocsCard>
    <DocsCard title="Monkey Patches."  href="./monkey-patches.md">
        {"Information about the js methods that highlight.io monkey patches."}
    </DocsCard>
    <DocsCard title="Privacy & Redaction."  href="./privacy.md">
        {"How to redact and strip out sensitive data in a highlight.io session."}
    </DocsCard>
    <DocsCard title="Proxying requests."  href="./proxying-highlight.md">
        {"How to proxy requests through your backend for security purposes."}
    </DocsCard>
    <DocsCard title="React Error Boundary"  href="./react-error-boundary.md">
        {"How to proxy requests through your backend for security purposes."}
    </DocsCard>
</DocsCardGroup>

---
title: Fullstack Mapping
slug: 4_backend-sdk
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

## What's this?

In order to make the most out of [highlight.io](https://highlight.io), we suggest instrumenting your frontend and backend so that you can attribute frontend requests with backend errors and logs. See an example below, where you can view an error's details alongside frontend session replay, allowing you to get the full context you need.

![](/images/fullstack-mapping.png)

Below, we detail the requirements to get this working as well as how to troubleshoot.

## How can I start using this?

### Install the client bundle

If you haven't already, you need to install our client javascript bundle in the framework of your choice. Get started below:
<DocsCardGroup>
<DocsCard title="Getting Started (Client)" href="./1_overview.md">
{"Install the `highlight.run` client bundle in your app."}
</DocsCard>
</DocsCardGroup>

### Turn on `tracingOrigins`

Set the `tracingOrigins` option to an array of patterns matching the location of your backend. You may also simply specify `true`, which will default `tracingOrigins` to all subdomains/domains of the url for your frontend app.

```javascript
H.init("<YOUR_PROJECT_ID>", {
	tracingOrigins: ['localhost', 'example.myapp.com/backend'],
    ...
});
```

### Turn on `networkRecording`

```javascript
H.init("<YOUR_PROJECT_ID>", {
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	...
});
```

## Backend Changes

Backend changes are dependent on the underlying language/framework used on the server-side codebase. All you need to add is a middleware and code to capture errors.

Below are solutions for what we support today. If you'd like us to support a new framework, feel free to shoot us a message at [support@highlight.io](mailto:support@highlight.io) or drop us a note in our [discord](https://discord.gg/yxaXEAqgwN).

- [Go Backend Integration](4_backend-sdk/go)

- [JS Backend Integration](4_backend-sdk/js)

- [Python Backend Integration](4_backend-sdk/python)

- [Java Backend Integration](4_backend-sdk/java)

## Distributed Tracing

Your backend might be a distributed system with multiple services. Say, for example, a
frontend Next.js application with a Next.js backend ,which makes HTTP requests to
a Python FastAPI microservice. In a case like that, you may want errors and logs from your Python service to be
attributed to the frontend sessions in Highlight.

Our frontend -> backend tracing uses the `x-highlight-request` HTTP header to attribute frontend requests with backend errors and logs. So, in the case of the example above, assuming all of your services have the highlight sdk installed, if your Next.js backend performs an HTTP request to a FastAPI backend and you forward the `x-highlight-request` header along, the trace will carry over information about the frontend session.

```javascript
await fetch('my-fastapi-backend:8000/api', { headers: {'x-highlight-request': request.headers.get(`x-highlight-request`)} })
```

A more complex application might not make HTTP requests between backend services, however. Instead, it may
use a message broker like Kafka to queue up jobs. In that case, you'll need to add a way to
store the `x-highlight-request` you receive from the frontend along with your enqueued messages.
The service that consumes the messages can then pass the value to the highlight SDK via custom
error wrapping or logging code as per usual.

```javascript
// the receiving example references `request.headers`, but this could be read from another service-to-service protocol (ie. gRPC, Apache Kafka message)
const parsed = H.parseHeaders(request.headers)
H.consumeError(error, parsed.secureSessionId, parsed.requestId)
```

## Troubleshooting

1.  Ensure `tracingOrigins` and `networkRecording` are properly set.

2.  Ensure your backend has `CORS` configured for your frontend hostname, explicitly allowing header `x-highlight-request`.

3.  For debugging the backend SDK of your choice, in order to debug, we suggest enabling verbose logging. For example, in Go, add `highlight.SetDebugMode(myLogger)`

4.  If all else fails, please email us at support@highlight.io or join the #support channel on our [discord](https://discord.gg/yxaXEAqgwN).

---
title: Fullstack Frameworks
slug: nextjs-sdk
createdAt: 2022-04-01T20:28:06.000Z
updatedAt: 2022-10-18T22:40:13.000Z
---

---
title: Edge Runtime
slug: edge-runtime
heading: Edge Runtime
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
npm install @highlight-run/next
```

## Vercel Edge Runtime instrumentation

Edge runtime instrumentation is identical for both Page Router and App Router.

1. Create a file to export your `EdgeHighlight` wrapper function:

```typescript
// utils/edge-highlight.config.ts:
import { CONSTANTS } from '../../constants'
import { EdgeHighlight } from '@highlight-run/next/server'

export const withEdgeHighlight = EdgeHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

2. Wrap your edge function with `withEdgeHighlight`

**Page Router**
```typescript
// pages/api/edge-page-router-test.ts
import { NextRequest } from 'next/server'
import { withEdgeHighlight } from '../../utils/edge-highlight.config.ts'

export default withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: pages/api/edge-page-router-test', request.url)

	if (request.url.includes('error')) {
		throw new Error('Error: pages/api/edge-page-router-test (Edge Runtime)')
	} else {
		return new Response('Success: pages/api/edge-page-router-test')
	}
})

export const runtime = 'edge'
```

**App Router**
```typescript
// pages/api/edge-page-router-test.ts
import { NextRequest } from 'next/server'
import { withEdgeHighlight } from '../../utils/edge-highlight.config'

export default withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: pages/api/edge-page-router-test', request.url)

	if (request.url.includes('error')) {
		throw new Error('Error: pages/api/edge-page-router-test (Edge Runtime)')
	} else {
		return new Response('Success: pages/api/edge-page-router-test')
	}
})

export const runtime = 'edge'
```

## Validation

Copy/paste the above code snippet into `/app/api/edge-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

**Page Router**
```bash
curl http://localhost:3000/api/edge-page-router-test?error
```

**App Router**
```bash
curl http://localhost:3000/edge-app-router-test?error
```

## Related steps

- [Page Router client instrumentation](./2_page-router.md)
- [App Router client instrumentation](./3_app-router.md)
- [Advanced Configuration](./7_advanced-config.md)

---
title: Page Router Api
slug: page-router
heading: Next.js Page Router Api
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
npm install @highlight-run/next
```

## API route instrumentation

```hint
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually.
```

######

1. Create a file to export your `PageRouterHighlight` wrapper function:

 ```javascript
// utils/page-router-highlight.config.ts:
import { CONSTANTS } from '../constants'
import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
 ```

2. Wrap your `/pages/api` functions with `withPageRouterHighlight`:

```typescript
// pages/api/nodejs-page-router-test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '../../utils/page-router-highlight.config'

export default withPageRouterHighlight(function handler(req: NextApiRequest, res: NextApiResponse) {
	console.info('Here: pages/api/nodejs-page-router-test.ts')

	if (req.url?.includes('error')) {
		throw new Error('Error: pages/api/nodejs-page-router-test.ts')
	} else {
		res.send('Success: pages/api/nodejs-page-router-test.ts')
	}
})
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/pages/api/nodejs-page-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/api/nodejs-page-router-test?error
```

## Related steps

- [Page Router client instrumentation](./2_page-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
---
title: Advanced Config
slug: advanced-config
heading: Next.js Advanced Config
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## How Highlight captures Next.js errors

|              | Page Router           | App Router           |
|--------------|-----------------------|----------------------|
| API Errors   | `PageRouterHighlight` | `AppRouterHighlight` |
| SSR Errors   | `pages/_error.tsx`    | `app/error.tsx`      |
| Client       | `<HighlightInit />`   | `<HighlightInit />`  |
| Edge runtime | `EdgeHighlight`       | `EdgeHighlight`      |

Our Next.js SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. On the frontend, the `<HighlightInit/>` component sets up client-side session replays.
2. On the backend, the `PageRouterHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from Page Router API endpoints.
3. On the backend, the `AppRouterHighlight` wrapper exported from `@highlight-run/next/app-router` captures errors and logs from App Router API endpoints.
3. The `EdgeHighlight` wrapper exported from `@highlight-run/next/server` captures server-side errors and logs from both Page and App Router endpoints using Vercel's Edge runtime.
4. Use `pages/_error.tsx` and `app/error.tsx` to forward Page Router and App Router SSR errors from the client to Highlight.
5. The `withHighlightConfig` configuration wrapper automatically proxies Highlight data to bypass ad-blockers and uploads source maps so your frontend errors include stack traces to your source code.

## How Highlight captures Next.js logs

`<HighlightInit />` captures front-end logs.

`PageRouterHighlight` and `AppRouterHighlight` capture server-side logs in traditional server runtimes. These wrappers typically fail in serverless runtimes (including Vercel), because we cannot guarantee that the serverless process will stay alive long enough to send all log data to Highlight.

Configure logging for your serverless cloud provider using one of our [cloud provider logging guides](https://www.highlight.io/docs/getting-started/backend-logging/hosting/overview), including [Vercel Log Drain for Highlight](https://vercel.com/integrations/highlight).

## Environment variables

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing and replace our imports (`import { CONSTANTS } from 'src/constants'`) with your own!

1. Install Zod: `npm install zod`
2. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`

```bash
# .env
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='<API KEY>'
```

3. Feed your environment variables into the application with a constants file. We're using `zod` for this example, because it creates a validated, typed `CONSTANTS` object that plays nicely with TypeScript.

```javascript
// constants.ts
import { z } from 'zod';

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
};

export const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
	})
	.parse(publicEnv);
```

## Vercel Log Drain

Install our [Vercel + Highlight Integration](https://vercel.com/integrations/highlight) to enable Vercel Log Drain on your project. 

Our API wrappers automatically send logs to Highlight in all runtime environments, but Vercel shuts down its Node.js and Edge processes so quickly that log messages are often lost. 

Vercel Log Drain is a reliable way to capture those logs.

## Next.js plugin

Proxy your front-end Highlight calls by adding `withHighlightConfig` to your `next.config`. Frontend session recording and error capture data will be piped through your domain on `/highlight-events` to sneak Highlight network traffic past ad-blockers.

The following example demonstrates both private source maps and the request proxy. `withHighlightConfig` does not require a second argument if you are only using the request proxy.

### Request proxy only

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
	productionBrowserSourceMaps: true, // optionally ship source maps to production
}

module.exports = withHighlightConfig(nextConfig)
```

### Private source maps + request proxy

1. Get your Highlight API key from your [project settings](https://app.highlight.io/settings/errors#sourcemaps). You can also enable the [Highlight + Vercel integration](https://vercel.com/integrations/highlight) to inject `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` directly into your Vercel environment.

2. Verify that `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY=<apiKey>` is set in your environment variables--try `.env.local` for testing purposes--or pass `apiKey` in as an optional argument to `withHighlightConfig`.

3. Ensure that `productionBrowserSourceMaps` is either `false` or omitted.

4. Wrap your `nextConfig` with `withHighlightConfig`. `apiKey` is unnecessary if you have `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` in your environment variables.

5. Run `npm run build && npm run start` to test. Your logs should show files uploading like so:

```
Uploaded /root/dev/highlight/next-test/.next/server/pages/index.js
```

```javascript
// next.config.js
const { withHighlightConfig } = require('@highlight-run/next/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
	productionBrowserSourceMaps: false,
}

module.exports = withHighlightConfig(nextConfig, {
	apiKey: '<API KEY>',
	uploadSourceMaps: true,
})
```

## Configure `inlineImages`

We use a package called [rrweb](https://www.rrweb.io/) to record web sessions. rrweb supports inlining images into sessions to improve replay accuracy, so that images that are only available from your local network can be saved; however, the inlined images can cause CORS issues in some situations.

We currently default `inlineImages` to `true` on `localhost`. Explicitly set `inlineImages={false}` if you run into trouble loading images on your page while Highlight is running. This will degrade tracking on `localhost` and other domains that are inaccessible to `app.highlight.io`.

## Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details on how to associate your back-end errors to client sessions.
---
title: Next.js Fullstack Overview
slug: next-js
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

---
title: App Router Api
slug: app-router
heading: Next.js App Router Api
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
npm install @highlight-run/next
```

## API route instrumentation

Node.js 

```hint
 Each App Router route must be wrapped individually.
```

######

1. Add `@highlight-run/node` to `experimental.serverComponentsExternalPackages` in your `next.config.js`. 

```javascript
// next.config.js
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
}

module.exports = nextConfig
```

2. Create a file to export your `AppRouterHighlight` wrapper function:

```typescript
// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from '@highlight-run/next/server'
import { CONSTANTS } from '../constants'

export const withAppRouterHighlight = AppRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

3. Wrap your `/app` functions with `withAppRouterHighlight`: 

```typescript
// app/nodejs-app-router-test/route.ts
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '../../utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
	console.info('Here: app/nodejs-app-router-test/route.ts')

	if (request.url?.includes('error')) {
		throw new Error('Error: app/nodejs-app-router-test (App Router)')
	} else {
		return new Response('Success: app/nodejs-app-router-test')
	}
})
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/app/api/nodejs-app-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/nodejs-app-router-test?error
```

## Related steps

- [App Router client instrumentation](./3_app-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)

---
title: Page Router
slug: environment
heading: Next.js Page Router
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---


## Installation

```shell
npm install @highlight-run/next
```

## Client instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater. If you're behind on React versions, follow our [React.js docs](../../3_client-sdk/1_reactjs.md)

- Check out this example [environment variables](./7_advanced-config.md#environment-variables) set up for the `CONSTANTS` import.
- Add `<HighlightInit>` to `_app.tsx`.

```jsx
// pages/_app.tsx
import { AppProps } from 'next/app'
import { CONSTANTS } from '../constants'
import { HighlightInit } from '@highlight-run/next/client'

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<HighlightInit
				// excludedHostnames={['localhost']}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
			/>

			<Component {...pageProps} />
		</>
	)
}
```

## Add React ErrorBoundary (optional)

Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

You can wrap the root of your app in `_app.tsx` with the `<ErrorBoundary />`, or you can wrap individual parts of your React tree.


```jsx
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<HighlightErrorBoundary showDialog>
			{children}
		</HighlightErrorBoundary>
	)
}
```

## Validate client instrumentation

Render this example component somewhere in your client application to see it in action.

```hint
Omit the `ErrorBoundary` wrapper if you haven't created it yet.
```


```jsx
// pages/page-router-test.tsx
// http://localhost:3000/page-router-test
'use client'

import { useEffect, useState } from 'react'

import { ErrorBoundary } from '../components/error-boundary'

export default function ErrorButtons() {
	const [isErrored, setIsErrored] = useState(false)

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<ErrorBoundary>
				<button
					onClick={() => {
						throw new Error('Threw client-side Error')
					}}
				>
					Throw client-side onClick error
				</button>

				<ThrowerOfErrors isErrored={isErrored} setIsErrored={setIsErrored} />
				<button onClick={() => setIsErrored(true)}>Trigger error boundary</button>
				<button
					onClick={async () => {
						throw new Error('an async error occurred')
					}}
				>
					Trigger promise error
				</button>
			</ErrorBoundary>
		</div>
	)
}

function ThrowerOfErrors({
	isErrored,
	setIsErrored,
}: {
	isErrored: boolean
	setIsErrored: (isErrored: boolean) => void
}) {
	useEffect(() => {
		if (isErrored) {
			setIsErrored(false)
			throw new Error('Threw useEffect error')
		}
	}, [isErrored, setIsErrored])

	return null
}
```

## Enable server-side tracing

We use `experimental.instrumentationHook` to capture [Next.js's automatic instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry). This method captures detailed API route tracing as well as server-side errors.

1. Enable `experimental.instrumentationHook` in `next.config.js`.
```javascript
// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	experimental: {
		instrumentationHook: true,
	},
	// ...additional config
}

export default withHighlightConfig(nextConfig)
```

2. Call `registerHighlight` in `instrumentation.ts` or `src/instrumentation.ts` if you're using a `/src` folder. Make sure that `instrumentation.ts` is a sibling of your `pages` folder. 
```jsx
// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from './constants'

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		serviceName: 'my-nextjs-backend',
	})
}
```

## Catch server-side render (SSR) errors

Page Router uses [pages/_error.tsx](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#more-advanced-error-page-customizing) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

These SSR error will display as client errors on your Highlight dashboard.

```jsx
// pages/_error.tsx
import { PageRouterErrorProps, pageRouterCustomErrorHandler } from '@highlight-run/next/ssr'

import { CONSTANTS } from '../constants'
import NextError from 'next/error'

export default pageRouterCustomErrorHandler(
	{
		projectId: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		// ...otherHighlightOptions
	},
	/**
	 *
	 * This second argument is purely optional.
	 * If you don't pass it, we'll use the default Next.js error page.
	 *
	 * Go ahead and pass in your own error page.
	 */
	(props: PageRouterErrorProps) => <NextError {...props} />,
)
```

### Validate SSR error capture

1. Copy the following code into `pages/page-router-ssr.tsx`.
2. Build and start your production app with `npm run build && npm run start`.
3. Visit http://localhost:3000/page-router-ssr?error to trigger the error.
4. Once you've validated that the error is caught and sent to `app.highlight.io`, don't forget to `ctrl + c` to kill `npm run start` and restart with `npm run dev`.

```jsx
// pages/page-router-ssr.tsx
import { useRouter } from 'next/router'

type Props = {
	date: string
	random: number
}
export default function SsrPage({ date, random }: Props) {
	const router = useRouter()
	const isError = router.asPath.includes('error')

	if (isError) {
		throw new Error('SSR Error: pages/page-router-ssr.tsx')
	}

	return (
		<div>
			<h1>SSR Lives</h1>
			<p>The random number is {random}</p>
			<p>The date is {date}</p>
		</div>
	)
}

export async function getStaticProps() {
	return {
		props: {
			random: Math.random(),
			date: new Date().toISOString(),
		},
		revalidate: 10, // seconds
	}
}
```

### Skip localhost tracking

```hint
We do not recommend enabling this while integrating Highlight for the first time because it will prevent you from validating that your local build can send data to Highlight.
```

In the case that you don't want local sessions sent to Highlight, the `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging]}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

Alternatively, you could manually call `H.start()` and `H.stop()` to manage invocation on your own.

```jsx
// components/custom-highlight-start.tsx
'use client'

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export function CustomHighlightStart() {
	useEffect(() => {
		const shouldStartHighlight = window.location.hostname === 'https://www.highlight.io'

		if (shouldStartHighlight) {
			H.start()

			return () => {
				H.stop()
			}
		}
	})

	return null
}
```

```jsx
// pages/_app.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
/>
<CustomHighlightStart />
```

## Related steps

- [Page Router API instrumentation](./4_api-page-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
---
title: App Router
slug: environment
heading: Next.js App Router
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---


## Installation

```shell
npm install @highlight-run/next
```

## Client instrumentation

This sections adds session replay and frontend error monitoring to Highlight. This implementation requires React 17 or greater.

- Check out this example [environment variables](./7_advanced-config.md#environment-variables) set up for the `CONSTANTS` import.
- Add `HighlightInit` to your `layout.tsx` file.

```jsx
// app/layout.tsx
import { CONSTANTS } from '../constants'
import { HighlightInit } from '@highlight-run/next/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				// excludedHostnames={['localhost']}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true
				}}
			/>

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
```

## Add React ErrorBoundary (optional)

Optionally add a React [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

You can wrap the root of your app in `layout.tsx` with the `<ErrorBoundary />`, or you can wrap individual parts of your React tree.

```jsx
// components/error-boundary.tsx
'use client'

import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return <HighlightErrorBoundary showDialog>{children}</HighlightErrorBoundary>
}
```

## Validate client implementation

- Render this example component somewhere in your client application to see it in action.

```hint
Omit the `ErrorBoundary` wrapper if you haven't created it yet.
```

```jsx
// app/app-router-test/page.tsx
// http://localhost:3000/app-router-test
'use client'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from '../../components/error-boundary'

export default function ErrorButtons() {
	const [isErrored, setIsErrored] = useState(false)

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<ErrorBoundary>
				<button
					onClick={() => {
						throw new Error('Threw client-side Error')
					}}
				>
					Throw client-side onClick error
				</button>

				<ThrowerOfErrors isErrored={isErrored} setIsErrored={setIsErrored} />
				<button onClick={() => setIsErrored(true)}>Trigger error boundary</button>
				<button
					onClick={async () => {
						throw new Error('an async error occurred')
					}}
				>
					Trigger promise error
				</button>
			</ErrorBoundary>
		</div>
	)
}

function ThrowerOfErrors({
	isErrored,
	setIsErrored,
}: {
	isErrored: boolean
	setIsErrored: (isErrored: boolean) => void
}) {
	useEffect(() => {
		if (isErrored) {
			setIsErrored(false)
			throw new Error('Threw useEffect error')
		}
	}, [isErrored, setIsErrored])

	return null
}
```

## Enable server-side tracing

We use `experimental.instrumentationHook` to capture [Next.js's automatic instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry). This method captures detailed API route tracing as well as server-side errors.

1. Enable `experimental.instrumentationHook` in `next.config.js`.
```javascript
// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	experimental: {
		instrumentationHook: true,
	},
	// ...additional config
}

export default withHighlightConfig(nextConfig)
```

2. Call `registerHighlight` in `instrumentation.ts` or `src/instrumentation.ts` if you're using a `/src` folder. Make sure that `instrumentation.ts` is a sibling of your `pages` folder. 
```jsx
// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from './constants'

export async function register() {
	const { registerHighlight } = await import('@highlight-run/next/server')

	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		serviceName: 'my-nextjs-backend',
	})
}
```

## Catch server-side render (SSR) errors

App Router uses [app/error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) to send server-side render errors to the client. We can catch and consume those errors with a custom error page.

All SSR error will display as client errors on your Highlight dashboard.

We don't call `H.init` in this example because we injected `<HighlightInit />` into the layout using `app/layout.tsx`.

```jsx
// app/error.tsx
'use client' // Error components must be Client Components

import {
	appRouterSsrErrorHandler,
	AppRouterErrorProps,
} from '@highlight-run/next/ssr'

export default appRouterSsrErrorHandler(
	({ error, reset }: AppRouterErrorProps) => {
		console.error(error)

		return (
			<div>
				<h2>Something went wrong!</h2>
				<button
					onClick={
						() => reset() // Attempt to recover by trying to re-render the segment
					}
				>
					Try again
				</button>
			</div>
		)
	},
)
```

### Validate SSR error capture

1. Copy the following code into `app/app-router-ssr/page.tsx`.
2. Build and start your production app with `npm run build && npm run start`.
3. Visit http://localhost:3000/app-router-ssr?error to trigger the error.
4. Once you've validated that the error is caught and sent to `app.highlight.io`, don't forget to `ctrl + c` to kill `npm run start` and restart with `npm run dev`.

```jsx
// app/app-router-ssr/page.tsx
type Props = {
	searchParams: { error?: string }
}

export default function SsrPage({ searchParams }: Props) {
	if (typeof searchParams.error === 'string') {
		throw new Error('SSR Error: app/app-router-ssr/page.tsx')
	}

	return (
		<div>
			<h1>App Directory SSR: Success</h1>
			<p>The random number is {Math.random()}</p>
			<p>The date is {new Date().toLocaleTimeString()}</p>
		</div>
	)
}

export const revalidate = 30 // seconds
```

### Skip localhost tracking

```hint
We do not recommend enabling this while integrating Highlight for the first time because it will prevent you from validating that your local build can send data to Highlight.
```

In the case that you don't want local sessions sent to Highlight, the `excludedHostnames` prop accepts an array of partial or full hostnames. For example, if you pass in `excludedHostnames={['localhost', 'staging]}`, you'll block `localhost` on all ports, `www.staging.highlight.io` and `staging.highlight.com`.

Alternatively, you could manually call `H.start()` and `H.stop()` to manage invocation on your own.


```jsx
// components/custom-highlight-start.tsx
'use client'

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export function CustomHighlightStart() {
	useEffect(() => {
		const shouldStartHighlight = window.location.hostname === 'https://www.highlight.io'

		if (shouldStartHighlight) {
			H.start()

			return () => {
				H.stop()
			}
		}
	})

	return null
}
```

```jsx
// app/layout.tsx
<HighlightInit
	manualStart
	projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
	serviceName="my-nextjs-frontend"
/>
<CustomHighlightStart />
```

## Related steps

- [App Router API instrumentation](./5_api-app-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
---
title: Next.js Fullstack Overview
slug: overview
heading: Next.js Overview
createdAt: 2023-05-10T00:00:00.000Z
updatedAt: 2023-05-10T00:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/Dyoba16wE-o"
  title="Youtube Video Player"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Get started

<DocsCardGroup>
  <DocsCard title="Page Router" href="./2_page-router.md">
    {"Instrument Page Router."}
  </DocsCard>
  <DocsCard title="App Router" href="./3_app-router.md">
    {"Instrument App Router."}
  </DocsCard>

  <DocsCard title="Page Router API" href="./4_api-page-router.md">
    {"Instrument Page Router API routes."}
  </DocsCard>
  <DocsCard title="App Router API" href="./5_api-app-router.md">
    {"Instrument App Router API routes."}
  </DocsCard>
  <DocsCard title="Edge Runtime" href="./6_edge-runtime.md">
    {"Instrument Edge runtime API routes."}
  </DocsCard>

  <DocsCard title="Advanced Config" href="./7_advanced-config.md">
    {"Advanced configuration tips"}
  </DocsCard>
</DocsCardGroup>

---
title: Remix Walkthrough
slug: remix
heading: Remix Walkthrough
createdAt: 2023-07-20T00:00:00.000Z
updatedAt: 2023-07-20T00:00:00.000Z
---

## Overview

Our Remix SDK gives you access to frontend session replays and server-side monitoring,
all-in-one. 

1. Use `<HighlightInit />` to track session replay and client-side errors.
1. Use `H.init` to instrument Remix's `nodejs` server.

## Installation

```shell
# with yarn
yarn add @highlight-run/remix
```

## Client Instrumentation

- Inject `<HighlightInit />` into your app root.
- Optionally configure `excludedHostnames` to block a full or partial hostname. For example, `excludedHostnames={['staging']}` would not initialize Highlight on `staging.highlight.io`.
- Configure `tracingOrigins` and `networkRecording`

See [Fullstack Mapping](https://www.highlight.io/docs/getting-started/frontend-backend-mapping#how-can-i-start-using-this) for details.

```javascript
// app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/client'
import { json } from '@remix-run/node'


export async function loader() {
	return json({
		ENV: {
			HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID,
		},
	})
}

export default function App() {
	const { ENV } = useLoaderData()

	return (
		<html lang="en">
			<HighlightInit
				excludedHostnames={['localhost']}
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				serviceName="my-remix-frontend"
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>
			{/* Render head, body, <Outlet />, etc. */}
		</html>
	)
}

```

- Optionally Create an `ErrorBoundary` component and export it from `app/root.tsx`

```javascript
// app/components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ReportDialog } from '@highlight-run/remix/report-dialog'

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>
					{error.status} {error.statusText}
				</h1>
				<p>{error.data}</p>
			</div>
		)
	} else if (error instanceof Error) {
		return (
			<div>
				<script src="https://unpkg.com/highlight.run"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							H.init('\${process.env.HIGHLIGHT_PROJECT_ID}');
						`,
					}}
				/>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>

				<ReportDialog />
			</div>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
```

```javascript
// app/root.tsx
export { ErrorBoundary } from '~/components/error-boundary'
```
 
## Server Instrumentation

1. Use `H.init` from `@highlight-run/remix/server` to instrument the Remix server on Node.js.
1. Import `HandleError` from `@highlight-run/remix/server` and export `handleError` after setting `nodeOptions`.


```javascript
// app/entry.server.tsx
import { HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export const handleError = HandleError(nodeOptions)

// Handle server requests

```

Alternatively, you can wrap Highlight's error handler and execute your own custom error handling code as well.

```javascript
// app/entry.server.tsx
import type { DataFunctionArgs } from '@remix-run/node'

import { H, HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export function handleError(
	error: unknown,
	dataFunctionArgs: DataFunctionArgs,
) {
	const handleError = HandleError(nodeOptions)

	handleError(error, dataFunctionArgs)

	// custom error handling logic here
}

H.init(nodeOptions)

// Handle server requests
```

Handle streaming HTML responses using the `onError` handler of [`renderToPipeableStream`](https://remix.run/docs/en/1.19.3/guides/streaming#enable-react-18-streaming)


```javascript
function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				onShellReady() {
					shellRendered = true
					const body = new PassThrough()

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					if (shellRendered) {
						logError(error, request)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}

function logError(error: unknown, request?: Request) {
	const parsed = request
		? H.parseHeaders(Object.fromEntries(request.headers))
		: undefined

	if (error instanceof Error) {
		H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
	} else {
		H.consumeError(
			new Error(`Unknown error: ${JSON.stringify(error)}`),
			parsed?.secureSessionId,
			parsed?.requestId,
		)
	}

	console.error(error)
}
```

---
title: Go
slug: go
heading: Tracing in Go
createdAt: 2023-10-16T00:00:00.000Z
updatedAt: 2023-10-16T00:00:00.000Z
quickstart: true
---

<QuickStart content={quickStartContent["traces"]["go"]["other"]}/>

---
title: OTLP
slug: otlp
heading: Tracing via OTLP
createdAt: 2023-10-16T00:00:00.000Z
updatedAt: 2023-10-16T00:00:00.000Z
quickstart: true
---

<QuickStart content={quickStartContent["traces"]["otlp"]["otlp"]}/>

---
title: 'Tracing'
slug: tracing
createdAt: 2023-10-16T00:00:00.000Z
updatedAt: 2023-10-16T00:00:00.000Z
---


---
title: Overview
slug: overview
createdAt: 2023-10-16T00:00:00.000Z
updatedAt: 2023-10-16T00:00:00.000Z
---

Tracing enables you to analyze performance and pinpoint where errors are happening in your application. Each trace corresponds to a request to your backend and is made up of one or more child spans. Tracing is supported with the Highlight Go SDK or via the OpenTelemetry protocol (OTLP).

<DocsCardGroup>
    <DocsCard title="Go" href="./3_go.md">
        {"Get started in your Go app"}
    </DocsCard>
    <DocsCard title="OTLP"  href="./2_other.md">
        {"Get started with OTLP"}
    </DocsCard>
</DocsCardGroup>

---
title: Getting Started
slug: getting-started
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

---
title: Docker / Docker Compose
slug: docker
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["docker"]}/>

---
title: Winston
heading: Logging in Winston
slug: winston
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["js"]["winston"]}/>

---
title: JS
slug: js
---

---
title: Cloudflare Workers
heading: Logging in Cloudflare Workers
slug: cloudflare
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["js"]["cloudflare"]}/>

---
title: Pino
heading: Logging in Pino.js
slug: pino
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["js"]["pino"]}/>

---
title: Nest.js
heading: Logging in Nest.js
slug: nestjs
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["js"]["nestjs"]}/>

---
title: Node.js
heading: Logging in Node.js
slug: nodejs
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["js"]["nodejs"]}/>

---
title: Overview
headline: Logging in Typescript / Javascript
slug: logging-in-js
---

Highlight.io supports logging in typescript & javascript, which maps your logs to corresponding errors and sessions. This gives you and your team a full picture of your application's state. Supported frameworks below:

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```

<DocsCardGroup>
    <DocsCard title="NestJS" href="./nestjs.md">
        {"Integrate logging in NestJS."}
    </DocsCard>
    <DocsCard title="NodeJS" href="./nodejs.md">
        {"Integrate logging in NodeJS."}
    </DocsCard>
    <DocsCard title="Winston" href="./winston.md">
        {"Integrate logging in Winston.js."}
    </DocsCard>
    <DocsCard title="Pino" href="./pino.md">
        {"Integrate logging in Pino.js."}
    </DocsCard>
    <DocsCard title="Cloudflare" href="./cloudflare.md">
        {"Integrate logging in Cloudflare Workers."}
    </DocsCard>
</DocsCardGroup>

---
title: Systemd / Journald
slug: systemd
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["systemd"]}/>

---
title: Java
slug: java
---

---
title: Java App
slug: other
createdAt: 2023-05-41T21:51:15.000Z
updatedAt: 2023-05-41T21:51:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["java"]["other"]}/>

---
title: Overview
headline: Logging in Java
slug: logging-in-java
---

Highlight.io supports logging in java, which maps your logs to corresponding errors and sessions. This gives you and your team a full picture of your application's state. Supported frameworks below:

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```

<DocsCardGroup>
    <DocsCard title="Other Java Frameworks" href="./other.md">
        {"Integrate logging in other Java Frameworks."}
    </DocsCard>
</DocsCardGroup>
---
title: File
slug: file
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["file"]}/>

---
title: Fluent Forward
slug: fluent-forward
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["fluent-forward"]}/>

---
title: Fly.io NATS Log Shipper
slug: fly-io
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["hosting"]["fly-io"]}/>

---
title: Logging in Trigger.dev
slug: trigger-dev
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Using Trigger.dev to run your background Vercel tasks? Get visibility into your code by shipping logs to highlight.

To do this, enable the Vercel integration in trigger and configure your trigger project for verbose logging.

---
title: Logging in GCP
slug: gcp
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Google Cloud Platform (GCP)? Stream your logs to highlight to see everything in one place.

Check out the following examples of setting up logs streaming in these services:

## GCP Cloud Logging with Pub/Sub export

1. Setup the [Google Ops Agent](https://cloud.google.com/stackdriver/docs/solutions/agents/ops-agent) to send your infrastructure or compute logs to [Google Cloud Logging](https://console.cloud.google.com/logs/query).

2. Create a [Cloud Pub/Sub topic](https://console.cloud.google.com/cloudpubsub/topic/list) for exporting your Google cloud logs.
![](/images/gcp/step1.png)

3. Setup a [Log Router Sink](https://console.cloud.google.com/logs/router) in Google Cloud Logging
![](/images/gcp/step2.png)

4. Setup a Pub/Sub Subscription to export to highlight.io over HTTPS. Set the delivery to Push on endpoint URL  https://pub.highlight.io/v1/logs/raw?project=YOUR_PROJECT_ID&service=backend-service
![](/images/gcp/step3.png)

At this point, your infrastructure / service logs should show up in [highlight](https://app.highlight.io/logs)!

---
title: Vercel Log Drain
slug: vercel
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["hosting"]["vercel"]}/>

---
title: Render Log Stream
slug: render
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["hosting"]["render"]}/>

---
title: Hosting Providers
slug: hosting
---

---
title: Logging in AWS
slug: aws
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Amazon Web Services (AWS)? Stream your logs to highlight to see everything in one place.
Most AWS Services support streaming logs via Fluent Forward though the exact configuration will differ.
Read the [AWS documentation here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html) to learn more.

Check out the following examples of setting up logs streaming in these services:

## AWS ECS Containers

To stream your container logs to highlight from an ECS Fargate container, we recommend running a fluent-bit agent alongside the container
to stream logs to highlight (which accepts AWS FireLens logs via the [Fluent Forward](https://docs.fluentbit.io/manual/pipeline/outputs/forward/ protocol)).

Here's a sample task definition (based on the [AWS docs](https://github.com/aws-samples/amazon-ecs-firelens-examples/tree/mainline/examples/fluent-bit/ecs-log-collection)) containing a dummy app container and a fluent-bit agent configured alongside.

```json
{
  "family": "firelens-example-highlight",
  "taskRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/ecs_task_iam_role",
  "executionRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/ecs_task_execution_role",
  "containerDefinitions": [
    {
      "essential": true,
      "image": "906394416424.dkr.ecr.us-east-1.amazonaws.com/aws-for-fluent-bit:stable",
      "name": "log_router",
      "firelensConfiguration":{
        "type":"fluentbit"
      }
    },
    {
      "essential": true,
      "image": "my-app:latest",
      "name": "app",
      "logConfiguration": {
        "logDriver":"awsfirelens",
        "options": {
          "Name": "Forward",
          "Host": "otel.highlight.io",
          "Tag": "highlight.project_id=<YOUR_PROJECT_ID>"
        }
      }
    }
  ]
}

```

## AWS Kinesis Firehose for logs from infrastructure or other services

Let's say you are running RDS Postgres or MSK Kafka services that are core infrastructure for your application, and you are interested in searching and browsing the logs. The best way to export such infrastructure logs is via [AWS Kinesis Firehose shipping to our HTTP logs endpoint](https://aws.amazon.com/blogs/big-data/stream-data-to-an-http-endpoint-with-amazon-kinesis-data-firehose/). 

First, create a Kinesis Data Stream.

![](/images/aws/kinesis/step1.png)

Next, create a Kinesis Data Firehose with an HTTP destination to route data to highlight.

Configure your Kinesis data stream to ship logs to HTTP https://pub.highlight.io/v1/logs/firehose, enabling GZIP content encoding and passing paramater `x-highlight-project` with your highlight project ID.


![](/images/aws/kinesis/step2.png)

Finally, connect your AWS CloudWatch Log Stream to the Kinesis Data Stream via a Kinesis Subscription Filter.

![](/images/aws/kinesis/step3.png)

If you have any questions with your setup, don't hesitate to [reach out](https://community.highlight.io)!

---
title: Overview
headline: Logging in Python
slug: logging-in-python
---

Highlight.io supports logging in most cloud providers. For common hosting solutions, we've written guides or integrations that simplify the setup.

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```


<DocsCardGroup>
    <DocsCard title="Amazon Web Services" href="./aws.md">
        {"Set up logging in AWS."}
    </DocsCard>
    <DocsCard title="Microsoft Azure" href="./azure.md">
        {"Set up logging in Azure."}
    </DocsCard>
    <DocsCard title="Google Cloud" href="./gcp.md">
        {"Set up logging in GCP."}
    </DocsCard>
    <DocsCard title="Fly.io" href="./fly-io.md">
        {"Set up logging in Fly."}
    </DocsCard>
    <DocsCard title="Render" href="./render.md">
        {"Set up logging in Render."}
    </DocsCard>
    <DocsCard title="Trigger.dev" href="./trigger.md">
        {"Set up logging in Trigger."}
    </DocsCard>
    <DocsCard title="Vercel" href="./vercel.md">
        {"Set up logging in Vercel."}
    </DocsCard>
</DocsCardGroup>

---
title: Logging in Azure
slug: azure
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Microsoft Azure? Stream your logs to highlight to see everything in one place.

Check out the following examples of setting up logs streaming in these services:

## Azure Logging

1. Setup the [Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-create) to enable streaming logs. 
![](/images/azure/step1.png)
![](/images/azure/step1b.png)

2. Create an [Azure Function triggered by Event Hubs](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-hubs-trigger?tabs=python-v2%2Cin-process%2Cfunctionsv2%2Cextensionv5&pivots=programming-language-csharp) that will forward logs to highlight.
![](/images/azure/step2.png)
![](/images/azure/step2b.png)

3. Configure the Azure Function with the following Node.js code, updating the values for `PROJECT_ID` and `SERVICE`:
```typescript
// Unless explicitly stated otherwise all files in this repository are licensed
// under the Apache License Version 2.0.

var https = require("https");

const PROJECT_ID = process.env.PROJECT_ID || "<YOUR_PROJECT_ID>";
const SERVICE = process.env.SERVICE || "azure";

const MAX_RETRIES = 4; // max number of times to retry a single http request
const RETRY_INTERVAL = 250; // amount of time (milliseconds) to wait before retrying request, doubles after every retry

class HTTPClient {
  constructor(context) {
    this.context = context;
    this.httpOptions = {
      hostname: "pub.highlight.io",
      path: "/v1/logs/json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-highlight-project": PROJECT_ID,
        "x-highlight-service": SERVICE
      }
    };
  }

  async sendAll(records) {
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      promises.push(this.send(records[i]));
    }
    return await Promise.all(
      promises.map(p => p.catch(e => this.context.log.error(e)))
    );
  }

  isStatusCodeValid(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
  }

  shouldStatusCodeRetry(statusCode) {
    // don't retry 4xx responses
    return (
      !this.isStatusCodeValid(statusCode) &&
      (statusCode < 400 || statusCode > 499)
    );
  }

  send(record) {
    var numRetries = MAX_RETRIES;
    var retryInterval = RETRY_INTERVAL;
    return new Promise((resolve, reject) => {
      const sendRequest = (options, record) => {
        const retryRequest = errMsg => {
          if (numRetries === 0) {
            return reject(errMsg);
          }
          this.context.log.warn(
            `Unable to send request, with error: ${errMsg}. Retrying ${numRetries} more times`
          );
          numRetries--;
          retryInterval *= 2;
          setTimeout(() => {
            sendRequest(options, record);
          }, retryInterval);
        };
        const req = https
          .request(options, resp => {
            if (this.isStatusCodeValid(resp.statusCode)) {
              resolve(true);
            } else if (
              this.shouldStatusCodeRetry(resp.statusCode)
            ) {
              retryRequest(
                `invalid status code ${resp.statusCode}`
              );
            } else {
              reject(`invalid status code ${resp.statusCode}`);
            }
          })
          .on("error", error => {
            retryRequest(error.message);
          })
          .on("timeout", () => {
            req.destroy();
            retryRequest(
              `request timed out`
            );
          });
        req.write(JSON.stringify({ message: record, timestamp: new Date().getTime(), level: 'log' }));
        req.end();
      };
      sendRequest(this.httpOptions, record);
    });
  }
}

module.exports = async function(context, eventHubMessages) {
  if (!PROJECT_ID || PROJECT_ID === "<YOUR_PROJECT_ID>") {
    context.log.error("Please configure the highlight project ID.");
    return;
  }
  var results = await new HTTPClient(context).sendAll(eventHubMessages);

  if (results.every(v => v === true) !== true) {
    context.log.error("An error occurred sending some messages");
  }
};

```
![](/images/azure/step3a.png)

Click on Integration then Azure Event Hubs under trigger and check the following settings:
   a. Event Parameter Name is set to eventHubMessages.
   b. Event Hub Cardinality is set to Many.
   c. Event Hub Data Type is left empty.
![](/images/azure/step3b.png)

4. Enable Azure service diagnostic settings in the Activity Log to send logs to the Event Hub, which in turn will be streamed to highlight by the function created in step 3.
![](/images/azure/step4.png)


At this point, your infrastructure / service logs (for which you enabled the diagnostic setting) should show up in [highlight](https://app.highlight.io/logs)!

---
title: 'Backend: Logging'
slug: backend-logging
createdAt: 2022-03-28T20:05:46.000Z
updatedAt: 2022-04-01T20:40:53.000Z
---

---
title: fiber
heading: Logging in Go / Fiber
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["go"]["fiber"]}/>

---
title: Go
slug: go
---

---
title: other
heading: Logging in Go / Other Frameworks
slug: other
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["go"]["other"]}/>

---
title: logrus
heading: Logging in Go / Logrus
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["go"]["logrus"]}/>

---
title: Overview
headline: Logging in Go
slug: logging-in-go
---

Highlight.io supports logging in Go, which maps your logs to corresponding errors and sessions. This gives you and your team a full picture of your application's state. Supported frameworks below:

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```

<DocsCardGroup>
    <DocsCard title="Go: Fiber" href="./fiber.md">
        {"Integrate logging in Go / Fiber."}
    </DocsCard>
    <DocsCard title="Go: Logrus" href="./logrus.md">
        {"Integrate logging in Go / Logrus."}
    </DocsCard>
    <DocsCard title="Go: Other" href="./other.md">
        {"Integrate logging in any other Go-based app."}
    </DocsCard>
</DocsCardGroup>
---
title: Rails
slug: rails
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["ruby"]["rails"]}/>

---
title: Ruby
slug: ruby
---

---
title: Ruby App
slug: other
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["ruby"]["other"]}/>

---
title: Overview
headline: Logging in Ruby
slug: logging-in-ruby
---

Highlight.io supports logging in ruby, which maps your logs to corresponding errors and sessions. This gives you and your team a full picture of your application's state. Supported frameworks below:

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```

<DocsCardGroup>
    <DocsCard title="Rails" href="./rails.md">
        {"Integrate logging in Rails."}
    </DocsCard>
    <DocsCard title="Other Ruby Frameworks" href="./other.md">
        {"Integrate logging in other Ruby Frameworks."}
    </DocsCard>
</DocsCardGroup>
---
title: Syslog RFC5424
slug: syslog
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["syslog"]}/>

---
title: curl
slug: http
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["other"]["curl"]}/>

---
title: Loguru
heading: Logging in Python with Loguru
slug: loguru
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["python"]["loguru"]}/>

---
title: Python
slug: python
---

---
title: Python
heading: Logging in Python
slug: other
quickstart: true
---

<QuickStart content={quickStartContent["backend-logging"]["python"]["other"]}/>

---
title: Overview
headline: Logging in Python
slug: logging-in-python
---

Highlight.io supports logging in python, which maps your logs to corresponding errors & sessions. This gives you and your team a full picture of your application's state. Supported frameworks below:

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```


<DocsCardGroup>
    <DocsCard title="Loguru" href="./loguru.md">
        {"Integrate with Loguru."}
    </DocsCard>
    <DocsCard title="logging" href="./other.md">
        {"Integrate with Python native logging."}
    </DocsCard>
</DocsCardGroup>

---
heading: Getting Started - highlight.io
title: Get Started
slug: getting-started
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-04-01T19:52:59.000Z
---

Highlight.io allows you to get full-stack visibility into issues across your whole stack, all the way from a user's button click to an error in your backend infrastructure. Read more about how to get started below.

## For your Frontend

Installing highlight.io in javascript will automatically instrument frontend error collection and session replay. highlight.io supports any framework that uses modern web browsers (i.e. depends on using the [DOM](https://www.w3schools.com/js/js_htmldom.asp)) under the hood, and we support all modern browsers to date. Take a look at our guides for the following frameworks:

<DocsCardGroup>
    <DocsCard title="React" href="./client-sdk/reactjs.md">
        {"Get started in your React.js app"}
    </DocsCard>
    <DocsCard title="Angular"  href="./client-sdk/angular.md">
        {"Get started in your Angular.js app"}
    </DocsCard>
    <DocsCard title="Gatsby"  href="./client-sdk/gatsbyjs.md">
        {"Get started in your Gatsby app"}
    </DocsCard>
    <DocsCard title="Next.js"  href="./client-sdk/nextjs.md">
        {"Get started in your Next.js app"}
    </DocsCard>
    <DocsCard title="Remix"  href="./client-sdk/remix.md">
        {"Get started in your Remix app"}
    </DocsCard>
    <DocsCard title="VueJS"  href="./client-sdk/vuejs.md">
        {"Get started in your VueJS app"}
    </DocsCard>
    <DocsCard title="SvelteKit"  href="./3_client-sdk/6_sveltekit.md">
        {"Get started in your SvelteKit app"}
    </DocsCard>
    <DocsCard title="Other HTML"  href="./3_client-sdk/7_other.md">
        {"Get started in any HTML/JS app"}
    </DocsCard>
</DocsCardGroup>

## For your Backend: Error Monitoring

Highlight.io also supports reporting errors from your backend and mapping these to corresponding sessions. This gives you and your team a full picture of your application's state. Supported frameworks / languages below:

<DocsCardGroup>
    <DocsCard title="Python" href="./backend-sdk/python/overview">
        {"Get started with error monitoring in Python"}
    </DocsCard>
    <DocsCard title="Go" href="./backend-sdk/go/overview">
        {"Get started with error monitoring in Go"}
    </DocsCard>
    <DocsCard title="JS / TS" href="./backend-sdk/js/overview">
        {"Get started with error monitoring in Javascript"}
    </DocsCard>
    <DocsCard title="Ruby" href="./4_backend-sdk/ruby/1_overview.md">
        {"Get started with error monitoring in Ruby"}
    </DocsCard>
    <DocsCard title="Java" href="./4_backend-sdk/java/1_overview.md">
        {"Get started with error monitoring in Java"}
    </DocsCard>
</DocsCardGroup>

## For your Backend: Logging

Highlight.io also supports logging from your backend and mapping these to corresponding errors and sessions. This gives you and your team a full picture of your application's state. Supported frameworks / languages below:

### Application Logging

<DocsCardGroup>
    <DocsCard title="Go" href="./backend-logging/01_go/1_overview.md">
        {"Get started with logging in Go"}
    </DocsCard>
    <DocsCard title="JS / TS" href="./backend-logging/02_js/1_overview.md">
        {"Get started with logging in Javascript"}
    </DocsCard>
    <DocsCard title="Python" href="./backend-logging/03_python/1_overview.md">
        {"Get started with logging in Python"}
    </DocsCard>
    <DocsCard title="Ruby" href="./backend-logging/04_ruby/1_overview.md">
        {"Get started with logging in Ruby"}
    </DocsCard>
    <DocsCard title="Java" href="./backend-logging/05_java/1_overview.md">
        {"Get started with logging in Java"}
    </DocsCard>
</DocsCardGroup>

### Hosting Platform Logging

<DocsCardGroup>
    <DocsCard title="Cloud" href="./backend-logging/06_hosting/1_overview.md">
        {"Log from your Cloud Hosting Environment"}
    </DocsCard>
    <DocsCard title="curl" href="./backend-logging/07_http.md">
        {"Send logs over HTTPS"}
    </DocsCard>
    <DocsCard title="Docker" href="./backend-logging/08_docker.md">
        {"Stream Docker logs"}
    </DocsCard>
    <DocsCard title="Fluent Forward" href="./backend-logging/10_fluentforward.md">
        {"Send Fluent Forward (Fluentd / Fluent Bit) logs"}
    </DocsCard>
    <DocsCard title="File" href="./backend-logging/09_file.md">
        {"Stream any log file"}
    </DocsCard>
</DocsCardGroup>

### Something missing?

If there's a guide missing for your framework, feel free to [create an issue](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=) or message us on [discord](https://highlight.io/community).

---
title: Docs Home
slug: home
createdAt: 2022-04-01T20:28:14.000Z
updatedAt: 2022-04-15T02:07:22.000Z
---

---
title: Go SDK API Reference
slug: go
---

<section className="section">
  <div className="left">
    <h3>Go SDK</h3>
    <p>
      Highlight's [Go SDK](https://pkg.go.dev/github.com/highlight/highlight/sdk/highlight-go) makes it easy to monitor errors and logs on your Go backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/go/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.Start()</h3>
    <p>Starts the background goroutine for transmitting metrics and errors.</p>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>WithServiceName</code> <code>optional</code></h5>
      <p>The name of your app.</p>
      <h5><code>WithServiceVersion</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        highlight.Start(
          highlight.WithServiceName("my-app"),
          highlight.WithServiceVersion("git-sha"),
        )
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.StartWithContext()</h3>
    <p>StartWithContext is used to start the Highlight client's collection service, 
but allows the user to pass in their own context.Context. 
This allows the user kill the highlight worker by canceling their context.CancelFunc.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The context provided for starting the Highlight daemon.</p>
    </aside>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>WithServiceName</code> <code>optional</code></h5>
      <p>The name of your app.</p>
      <h5><code>WithServiceVersion</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        ctx := context.Background()
        ...
        highlight.startWithContext(ctx,
          highlight.WithServiceName("my-app"),
          highlight.WithServiceVersion("git-sha"),
        )
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.Stop()</h3>
    <p>Stop the Highlight client. Does not wait for all un-flushed data to be sent.</p>
  </div>
  <div className="right">
    <code>
        highlight.Stop()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.SetProjectID()</h3>
    <p>Configure your Highlight project ID. See the [setup page for your project](https://app.highlight.io/setup).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>id <code>string</code> <code>required</code></h5>
      <p>The project ID.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        highlight.SetProjectID("<YOUR_PROJECT_ID>")
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.RecordError()</h3>
    <p>Record errors thrown in your backend.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from highlight.InterceptRequest().</p>
      <h5>err <code>error</code> <code>required</code></h5>
      <p>The error to report.</p>
     <h5>tags <code>...struct{Key: string, Value: string}</code> <code>optional</code></h5>
      <p>Additional tags to identify this error.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        ctx := context.Background()
        result, err := myOperation(ctx)
        if err != nil {
            highlight.RecordError(ctx, err)
        }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.RecordMetric()</h3>
    <p>Record metrics from your backend to be visualized in Highlight charts.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from highlight.InterceptRequest().</p>
      <h5>name <code>string</code> <code>required</code></h5>
      <p>The metric name.</p>
      <h5>value <code>float64</code> <code>required</code></h5>
      <p>The metrics value.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        start := time.Now()
        defer func() {
            highlight.RecordMetric(
                ctx, "my.operation.duration-s", time.Since(start).Seconds(),
            )
        }()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.InterceptRequest()</h3>
    <p>Called under the hood by our middleware web backend handlers to extract the request context.
Use this if you are using the raw http server package and need to setup the Highlight context.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>r <code>*http.Request</code> <code>required</code></h5>
      <p>The incoming request.</p>
      <h5>ctx <code>context.Context</code> <code>optional</code></h5>
      <p>The incoming request context. Use InterceptRequestWithContext if you have an existing context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        func Middleware(next http.Handler) http.Handler {
            fn := func(w http.ResponseWriter, r *http.Request) {
                ctx := highlight.InterceptRequest(r)
                r = r.WithContext(ctx)
                highlight.MarkBackendSetup(r.Context())
                next.ServeHTTP(w, r)
            }
            return http.HandlerFunc(fn)
        }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.NewGraphqlTracer()</h3>
    <p>An http middleware for tracing GraphQL servers.</p>
    <h6>Configuration</h6>
    <aside className="parameter">
      <h5>highlight.NewGraphqlTracer().WithRequestFieldLogging()</h5>
      <p>Emits highlight logs with details of each graphql operation.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        server.Use(highlight.NewGraphqlTracer(string(util.PrivateGraph)).WithRequestFieldLogging())
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.GraphQLRecoverFunc()</h3>
    <p>A gqlgen recover function to capture panics.</p>
    <h6>Configuration</h6>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        server.SetRecoverFunc(highlight.GraphQLRecoverFunc())
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.GraphQLErrorPresenter()</h3>
    <p>A gqlgen error presenter.</p>
    <h6>Configuration</h6>
    <aside className="parameter">
      <h5>service<code>string</code> <code>required</code></h5>
      <p>The name of the service.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        privateServer.SetErrorPresenter(highlight.GraphQLErrorPresenter("private"))
    </code>
  </div>
</section>

---
title: Python SDK API Reference
slug: python
---

<section className="section">
  <div className="left">
    <h3>Python SDK</h3>
    <p>
      Highlight's [Python SDK](https://pypi.org/project/highlight-io/) makes it easy to monitor errors and logs on your Python backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/python/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H()</h3>
    <p>H() initializes the Highlight backend SDK.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>project_id<code>string</code> <code>required</code></h5>
      <p>The id of your project from app.highlight.io/setup</p>
    </aside>
    <aside className="parameter">
      <h5>integrations<code>List[Integration]</code> <code>optional</code></h5>
      <p>A list of integration instances.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">Integration properties</aside>
        <aside className="parameter">
          <h5><code>highlight_io.integrations.Integration</code> <code>optional</code></h5>
          <p>Use FlaskIntegration() for [Flask](https://flask.palletsprojects.com/en/2.2.x/) apps.</p>
          <p>Use DjangoIntegration() for [Django](https://www.djangoproject.com/) apps.</p>
          <p>Use FastAPIMiddleware for [FastAPI](https://fastapi.tiangolo.com/) apps.</p>
        </aside>
      </article>
    </aside>
    <aside className="parameter">
      <h5>instrument_logging<code>boolean</code> <code>optional</code></h5>
      <p>If enabled, Highlight will record log output from the logging module.</p>
    </aside>
    <aside className="parameter">
      <h5>service_name<code>string</code> <code>optional</code></h5>
      <p>The name of your app.</p>
    </aside>
    <aside className="parameter">
      <h5>service_version<code>string</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
  </div>
  <div className="right">
    In Flask, you'll add Highlight in your main app.py entrypoint.
    <code>
        import highlight_io
        from highlight_io.integrations.flask import FlaskIntegration
        app = Flask('test-app')
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          integrations=[FlaskIntegration()],
          instrument_logging=True,
          service_name="my-flask-app",
          service_version="git-sha", 
        )
    </code>
    In Django, you'll add Highlight to your settings.py file:
    <code>
        import highlight_io
        from highlight_io.integrations.django import DjangoIntegration
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          integrations=[DjangoIntegration()],
          instrument_logging=True,
          service_name="my-django-app",
          service_version="git-sha", 
        )
    </code>
    In FastAPI, you'll add Highlight as a middleware:
    <code>
        import highlight_io
        from highlight_io.integrations.fastapi import FastAPIMiddleware
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          instrument_logging=True,
          service_name="my-fastapi-app",
          service_version="git-sha", 
        )
        app = FastAPI()
        app.add_middleware(FastAPIMiddleware)
    </code>
  </div>
</section>
<section className="section">
  <div className="left">
    <h3>H.record_exception()</h3> 
    <p>Record arbitrary exceptions raised within your app.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>e <code>Exception</code> <code>optional</code></h5>
      <p>The exception to record. The contents and stacktrace will be recorded.</p>
    </aside>
    <aside className="parameter">
      <h5>attributes <code>dict[str, any]</code> <code>optional</code></h5>
      <p>Metadata to associate with this exception.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        try:
          for i in range(20):
            result = 100 / (10 - i)
            print(f'dangerous: {result}')
        except Exception as e:
          H.record_exception(e)
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.trace()</h3> 
    <p>Catch exceptions raised by your app using this context manager.
Exceptions will be recorded with the Highlight project and
associated with a frontend session when headers are provided. Exceptions
will be re-raised in case you want to have them propagate.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>session_id <code>string</code> <code>optional</code></h5>
      <p>A Highlight session ID that the request is being made from. If omitted, 
the error will be associated with the project ID passed to H().</p>
    </aside>
    <aside className="parameter">
      <h5>request_id <code>string</code> <code>optional</code></h5>
      <p>A Highlight network request ID that initiated the handler raising this error.</p>
    </aside>
    <aside className="parameter">
      <h5>attributes <code>dict[str, any]</code> <code>optional</code></h5>
      <p>Metadata to associate with this exception.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        with H.trace():
            for idx in range(1000):
                logging.info(f"hello {idx}")
                time.sleep(0.001)
                if random.randint(0, 100) == 1:
                    raise Exception(f"random error! {idx}")
            logging.warning("made it outside the loop!")
    </code>
  </div>
</section>

---
title: Next.JS SDK API Reference
slug: nextjs
quickstart: true
---

<section className="section">
  <div className="left">
    <h3>Next.js SDK</h3>
    <p>
      Highlight's Next.js SDK makes it easier to configure your Next.js app for session recording. It ships with helper functions to upload frontend source maps, proxy your Highlight requests, and monitor errors and metrics on your backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight</h3> 
    <p>Highlight() generates a function that you can use to wrap your API handlers to provide backend error monitoring. If an error is thrown during the handler's execution, it is sent to Highlight and linked to the frontend session which caused the error. Typically, you would configure any necessary settings, and then export a common wrapper you can use to wrap all of your API handlers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options <code>NodeOptions</code> <code>optional</code></h5>
      <p>The configuration for Highlight backend monitoring.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>projectID <code>boolean</code> <code>required</code></h5>
          <p>Your Highlight project ID.</p>
        </aside>
        <aside className="parameter">
          <h5>disableErrorSourceContext <code>boolean</code> <code>optional</code></h5>
          <p>Disables source code context lines for error reporting. This may be useful for performance if your source files are particularly large or memory is limited.</p>
        </aside>
        <aside className="parameter">
          <h5>errorSourceContextCacheSizeMB <code>number</code> <code>optional</code></h5>
          <p>Source files are cached in memory to speed up error reporting and avoid costly disk access. The default cache size is 10MB, but this can be overridden. Specifying a value <= 0 removes all cache size limits.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      import { PageRouterHighlight } from "@highlight-run/next/server";
 
      export const withPageRouterHighlight = PageRouterHighlight({projectID: '<YOUR_PROJECT_ID>'});
    </code>
    <code>
      import { withPageRouterHighlight } from "../highlight.config";
 
      const handler = async (req, res) => {
        res.status(200).json({ name: "Jay" });
      };
 
      export default withPageRouterHighlight(handler);
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>withHighlightConfig</h3> 
    <p>You can wrap your next.config.js settings with this function to automatically configure source map uploading and creating a rewrite to proxy Highlight requests. This function sets productionBrowserSourceMaps=true, adds a rewrite rule to return HTTP 404 for any .map files (to keep source map files private), uploads source maps to Highlight following any production build, and adds a rewrite rule from /highlight-events to pub.highlight.run for Highlight request proxying</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>uploadSourceMaps <code>boolean</code> <code>optional</code></h5>
      <p>Explicitly enable or disable source map uploading during production builds. By default, source maps are uploaded if both NextConfig.productionBrowserSourceMaps is not true and the API key is set through the apiKey option or HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>configureHighlightProxy <code>boolean</code> <code>optional</code></h5>
      <p>Configures a rewrite at /highlight-events for proxying Highlight requests.</p>
    </aside>
    <aside className="parameter">
      <h5>apiKey <code>string</code> <code>optional</code></h5>
      <p>API key used to link to your Highlight project when uploading source maps. This can also be set through the HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>appVersion <code>string</code> <code>optional</code></h5>
      <p>App version used when uploading source maps.</p>
    </aside>
    <aside className="parameter">
      <h5>serviceName <code>string</code> <code>optional</code></h5>
      <p>Name of your app.</p>
    </aside>
    <aside className="parameter">
      <h5>sourceMapsPath <code>string</code> <code>optional</code></h5>
      <p>The file system root directory containing all your source map files.</p>
    </aside>
    <aside className="parameter">
      <h5>sourceMapsBasePath <code>string</code> <code>optional</code></h5>
      <p>Base path to append to your source map URLs when uploaded to Highlight.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      
      import { withHighlightConfig } from "@highlight-run/next/config";
      export default withHighlightConfig({
        // your next.config.js options here

        // Note, withHighlightConfig works for Next version 
        // >= v12.1.0. withHighlightConfig returns a promise, 
        // which may be incompatible with other Next.js 
        // config generators that have not been well maintained.
      })
    </code>
  </div>
</section>

---
title: SDK
slug: sdk
---

---
title: Java SDK API Reference
slug: java
---

<section className="section">
  <div className="left">
    <h3>Java SDK</h3>
    <p>
      Highlight's [Java SDK](https://mvnrepository.com/artifact/io.highlight/highlight-sdk/latest) makes it easy to monitor errors and metrics on your Java backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](https://www.highlight.io/docs/getting-started/overview) to get up and running quickly.</p>
    <p>Import our maven dependency from [mvnrepository](https://mvnrepository.com/artifact/io.highlight/highlight-sdk/latest)</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.init</h3>
    <p>Highlight.init() initializes the Highlight backend SDK.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>projectId <code>string</code> <code>required</code></h5>
      <p>Your project ID as provided by the [setup page](https://app.highlight.io/setup).</p>
    </aside>
    <aside className="parameter">
      <h5>options <code>HighlightOptions</code> <code>required</code></h5>
      <p>The configuration for Highlight backend logging.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>backendUrl <code>string</code> <code>optional</code></h5>
          <p>Define your backend. Default value is 'https://otel.highlight.io:4318'</p>
        </aside>
        <aside className="parameter">
          <h5>environment <code>string</code> <code>optional</code></h5>
          <p>The current environment can be set to a specific value, such as 'development', as an example.</p>
        </aside>
        <aside className="parameter">
          <h5>version <code>string</code> <code>optional</code></h5>
          <p>The current version of your application</p>
        </aside>
        <aside className="parameter">
          <h5>serviceName <code>string</code> <code>optional</code></h5>
          <p>The service name of your application</p>
        </aside>
        <aside className="parameter">
          <h5>metric <code>boolean</code> <code>optional</code></h5>
          <p>Should certain metrics, such as the Java version and architecture being used, be logged?</p>
        </aside>
        <aside className="parameter">
          <h5>attributes <code>AttributesBuilder</code> <code>optional</code></h5>
          <p>Add your own attributes to the default log or error requests.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
 
	  HighlightOptions options = HighlightOptions.builder("PROJECT_ID")
      .build();
      if (!Highlight.isInitialized()) {
        Highlight.init(highlightOptions);
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.isInitialized</h3> 
    <p>Highlight.isInitialized() returns true if the Highlight backend SDK has been initialized. This may be handy if your initialization code could be called multiple times, e.g. if it is called conditionally from a request handler when a backend error or metric needs to be recorded.</p>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
 
	  HighlightOptions options = HighlightOptions.builder("PROJECT_ID")
      .build();
      if (!Highlight.isInitialized()) {
        Highlight.init(highlightOptions);
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.captureException</h3> 
    <p>Highlight.captureException() reports an error and its corresponding stack trace to Highlight. The secureSessionId  and requestId  properties are Highlight ids used to link an error to the session in which the error was thrown. These properties are sent via a header and included in every request to your backend once the Highlight client is initialized.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>throwable <code>Error</code> <code>required</code></h5>
      <p>The error being reported to Highlight.</p>
    </aside>
    <aside className="parameter">
      <h5>secureSessionId <code>string</code> <code>optional</code></h5>
      <p>A randomized id representing the Highlight session in which an error was thrown.</p>
    </aside>
    <aside className="parameter">
      <h5>requestId <code>string</code> <code>optional</code></h5>
      <p>A randomized id generated by the Highlight client representing the request for which an error was thrown.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
 
      try {
        Integer.parseInt("string");
      } catch (Exception e) {
        Highlight.captureException(e);
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.captureLog</h3> 
    <p>Highlight.captureLog() reports an log to Highlight. The secureSessionId  and requestId  properties are Highlight ids used to link the log to the session in which the log was called. These properties are sent via a header and included in every request to your backend once the Highlight client is initialized.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>severity <code>Severity</code> <code>required</code></h5>
      <p>The log being reported to Highlight.</p>
    </aside>
    <aside className="parameter">
      <h5>message <code>string</code> <code>required</code></h5>
      <p>The log being reported to Highlight.</p>
    </aside>
    <aside className="parameter">
      <h5>secureSessionId <code>string</code> <code>optional</code></h5>
      <p>A randomized id representing the Highlight session in which an error was thrown.</p>
    </aside>
    <aside className="parameter">
      <h5>requestId <code>string</code> <code>optional</code></h5>
      <p>A randomized id generated by the Highlight client representing the request for which an error was thrown.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
      import io.highlight.sdk.common.Severity;
 
      Highlight.captureLog(Severity.DEBUG, "Request '/info' finished.");
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.captureRecord</h3> 
    <p>Highlight.captureRecord() reports an log or error to Highlight.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>record <code>HighlightRecord</code> <code>required</code></h5>
      <p>A record being reported to Highlight.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
      import io.highlight.sdk.common.Severity;
	  import io.highlight.sdk.common.record.HighlightRecord;
 
      Highlight.captureRecord(HighlightRecord.log()
        .severity(Severity.DEBUG)
        .timeOccured(Instant.now())
        .message("Request '/info' finished."));
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>HighlightRecord.log</h3> 
    <p>HighlightRecord.log() is a helper method that can be used to create log records.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>record <code>HighlightLogRecord</code> <code>optional</code></h5>
      <p>When an argument is provided, the new record created is abstracting its previous values.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
      import io.highlight.sdk.common.Severity;
	  import io.highlight.sdk.common.record.HighlightRecord;
 
	  HighlightLogRecord recordOne = HighlightRecord.log()
        .severity(Severity.DEBUG)
        .timeOccured(Instant.now())
        .message("Request '/info' finished.")
        .build();
 
	  Highlight.captureRecord(recordOne);
 
	  HighlightLogRecord recordTwo = HighlightRecord.log(recordOne)
        .timeOccured(Instant.now())
        .build();

	  Highlight.captureRecord(recordTwo);
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>HighlightRecord.error</h3> 
    <p>HighlightRecord.error() is a helper method that can be used to create error records.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>record <code>HighlightErrorRecord</code> <code>optional</code></h5>
      <p>When an argument is provided, the new record created is abstracting its previous values.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.Highlight;
      import io.highlight.sdk.common.Severity;
	  import io.highlight.sdk.common.record.HighlightRecord;
 
	  HighlightErrorRecord recordOne = HighlightRecord.error()
        .severity(Severity.DEBUG)
        .timeOccured(Instant.now())
        .message(new NullPointerException("Request '/info' is missing arguments."))
        .build();
 
	  Highlight.captureRecord(recordOne);
 
	  HighlightErrorRecord recordTwo = HighlightRecord.error(recordOne)
        .timeOccured(Instant.now())
        .build();

	  Highlight.captureRecord(recordTwo);
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Severity</h3> 
    <p>Severity of a log message, along with its text and priority. The severity can be one of TRACE, DEBUG, INFO, WARN, ERROR, or FATAL, and each severity level can have an associated identifier and priority level.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>text <code>String</code> <code>optional</code></h5>
      <p>Represents the identifier of a log message. The log message identifier represents a unique identifier that can be used to identify and search for specific log messages, thereby enabling better logging results.</p>
    </aside>
    <aside className="parameter">
      <h5>priority <code>Priority</code> <code>optional</code></h5>
      <p>Represents the priority of a log message. The priority can be one of LOW, NORMAL, MEDIUM, or HIGH, and each priority level have an associated numeric difference value that is added to the severity ID when calculating the overall priority of a log message.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import io.highlight.sdk.common.Severity;
 
      Severity.info("route");
      Severity.info(Priority.HIGH);
      Severity.info("route", Priority.HIGH);
 
      Severity.TRACE
      Severity.DEBUG
      Severity.INFO
      Severity.WARN
      Severity.ERROR
      Severity.FATAL
    </code>
  </div>
</section>

---
title: Cloudflare Worker SDK API Reference
slug: cloudflare
---

<section className="section">
  <div className="left">
    <h3>Cloudflare Worker SDK</h3>
    <p>
      Highlight's Cloudflare Worker SDK lets you track your errors and responses in Cloudflare Workers
with no impact on performance..
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/js/cloudflare.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3> 
    <p>H.init() configures the highlight SDK and records console log methods. The session is inferred based on the incoming network request headers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>request<code>Request</code> <code>required</code></h5>
      <p>The incoming Cloudflare request object.</p>
    </aside>
    <aside className="parameter">
      <h5>env<code>{ HIGHLIGHT_PROJECT_ID: string }</code> <code>required</code></h5>
      <p>The Highlight project ID for routing errors.</p>
    </aside>
    <aside className="parameter">
      <h5>ctx<code>ExecutionContext</code> <code>required</code></h5>
      <p>The Cloudflare execution context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              // do something...
              console.log('hi!', {hello: 'world'})
              return new Response('hello!')
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.consumeError</h3> 
    <p>H.consumeError() reports an error and its corresponding stack trace to Highlight. The session is inferred based on the incoming network request headers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error<code>Error</code> <code>required</code></h5>
      <p>The exception to report as part of this request.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              try {
                  // do something...
                  return new Response('hello!')
              } catch (e: any) {
                  H.consumeError(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx, e)
                  throw e
              }
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.sendResponse</h3> 
    <p>H.sendResponse() traces a response from your backend. This allows tracking incoming and outgoing headers and bodies.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>response<code>Request</code> <code>required</code></h5>
      <p>The response to record.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              const response = return new Response('hello!')
              H.sendResponse(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx, response)
              return response
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.setAttributes</h3> 
    <p>H.setAttributes() attached structured log attributes to all subsequent console methods. Repeat calls with the same key update the value.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>attributes<code>Attributes</code> <code>required</code></h5>
      <p>An object of key: value pairs to set as structured log attributes.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              // do something...
              console.log('hi!', {hello: 'world'})
              H.setAttributes({my: 'attribute', is: Math.random()})
              console.warn('whoa')
              return new Response('hello!')
          },
      }
    </code>
  </div>
</section>

---
title: Node.JS SDK API Reference
slug: nodejs
---

<section className="section">
  <div className="left">
    <h3>Node.js SDK</h3>
    <p>
      Highlight's Node.js SDK makes it easy to monitor errors and metrics on your Node.js backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/js/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3>
    <p>H.init() initializes the Highlight backend SDK. If you are not using any of the provided handlers for [Express](../getting-started/4_backend-sdk/js/express.md), it is required to call this method before recording backend errors or metrics.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options<code>NodeOptions</code> <code>required</code></h5>
      <p>The configuration for Highlight backend monitoring.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>projectID <code>string</code> <code>required</code></h5>
          <p>Your project ID as provided by the [setup page](https://app.highlight.io/setup).</p>
        </aside>
        <aside className="parameter">
          <h5>disableErrorSourceContext <code>boolean</code> <code>optional</code></h5>
          <p>Disables source code context lines for error reporting. This may be useful for performance if your source files are particularly large or memory is limited.</p>
        </aside>
        <aside className="parameter">
          <h5>errorSourceContextCacheSizeMB <code>number</code> <code>optional</code></h5>
          <p>Source files are cached in memory to speed up error reporting and avoid costly disk access. The default cache size is 10MB, but this can be overridden. Specifying a value <= 0 removes all cache size limits.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/node";
       
      const highlightOptions = {};
      if (!H.isInitialized()) {
        H.init(highlightOptions);
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.isInitialized</h3> 
    <p>H.isInitialized() returns true if the Highlight backend SDK has been initialized. This may be handy if your initialization code could be called multiple times, e.g. if it is called conditionally from a request handler when a backend error or metric needs to be recorded.</p>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/node";
 
      const highlightOptions = {};
      if (!H.isInitialized()) {
        H.init(highlightOptions);
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.consumeError</h3> 
    <p>H.consumeError() reports an error and its corresponding stack trace to Highlight. The secureSessionId  and requestId  properties are Highlight ids used to link an error to the session in which the error was thrown. These properties are sent via a header and included in every request to your backend once the Highlight client is initialized. They can be parsed using the H.parseHeaders() helper method.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error<code>Error</code> <code>required</code></h5>
      <p>The error being reported to Highlight.</p>
    </aside>
    <aside className="parameter">
      <h5>secureSessionId<code>string</code> <code>required</code></h5>
      <p>A randomized id representing the Highlight session in which an error was thrown. This can be parsed from the network request's headers using H.parseHeaders().</p>
    </aside>
    <aside className="parameter">
      <h5>requestId<code>string</code> <code>required</code></h5>
      <p>A randomized id generated by the Highlight client representing the request for which an error was thrown. This can be parsed from the network request's headers using H.parseHeaders().</p>
    </aside>
    <aside className="parameter">
      <h5>metadata<code>object</code> <code>optional</code></h5>
      <p>Key-value pairs of metadata that should be associated with the error.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import * as http from 'http';
      import { H } from "@highlight-run/node";
 
      const onError = (request: http.IncomingMessage, error: Error): void => {
        const parsed = H.parseHeaders(request.headers);
        if (parsed !== undefined) {
          H.consumeError(error, parsed.secureSessionId, parsed.requestId, {"url": request.url})
        }
      };
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.recordMetric</h3> 
    <p>H.recordMetric() reports a metric to Highlight. Backend metrics can be used just like frontend metrics for creating custom dashboards. </p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>secureSessionId<code>string</code> <code>required</code></h5>
      <p>A randomized id representing the Highlight session making the network request. This can be parsed from the network request's headers using H.parseHeaders().</p>
    </aside>
    <aside className="parameter">
      <h5>name<code>string</code> <code>required</code></h5>
      <p>The name of the metric being reported.</p>
    </aside>
    <aside className="parameter">
      <h5>value<code>number</code> <code>required</code></h5>
      <p>The numeric value of the metric being reported.</p>
    </aside>
    <aside className="parameter">
      <h5>requestId<code>string</code> <code>optional</code></h5>
      <p>A randomized id generated by the Highlight client representing the request for this metric. This can be parsed from the network request's headers using H.parseHeaders(). If the metric is not request-specific, this argument can be omitted.</p>
    </aside>
    <aside className="parameter">
      <h5>tags<code>{ name: string; value: string }[]</code> <code>optional</code></h5>
      <p>Tags are arbitrary name-value pairs you can associate to your metrics. This is helpful for categorizing data in dashboards, e.g. for grouping or filtering metrics by particular tags.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/node";
 
      const handler = (request) => {
        const parsed = H.parseHeaders(request.headers);
        const start = Date.now();
        doInterestingWork();
        const elapsed = Date.now() - start;
        H.recordMetric(parsed.secureSessionId, "elapsedTimeMs", elapsed, parsed.requestId, ["user": "Zane"]);
      };
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.parseHeaders</h3> 
    <p>H.parseHeaders() is a helper function for extracting the Highlight secureSessionId and requestId from network requests. These fields are sent with network requests as the 'x-highlight-request' header, encoded as a slash-separated string: "{secureSessionId}/{requestId}"</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>headers<code>IncomingHttpHeaders</code> <code>required</code></h5>
      <p>The headers sent as part of your network request.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import * as http from 'http';
      import { H } from "@highlight-run/node";
 
      const onError = (request: http.IncomingMessage, error: Error): void => {
        const parsed = H.parseHeaders(request.headers);
        if (parsed !== undefined) {
          H.consumeError(error, parsed.secureSessionId, parsed.requestId)
        }
      };
    </code>
  </div>
</section>

---
title: Client SDK API Reference
slug: client
---

<section className="section">
  <div className="left">
    <h3>Client SDK</h3>
    <p>
      The Highlight client records and sends session data to Highlight. The Highlight client SDK contains functions to configure your recording, start and stop recording, and add custom user metadata and properties.
    </p>

  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3> 
    <p>This method is called to initialize Highlight in your application.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>projectId<code>String</code> <code>optional</code></h5>
      <p>The projectId tells Highlight where to send data to. You can find your projectId on https://app.highlight.io/setup. If projectId is not set, then Highlight will not send any data. You can use this as a mechanism to control which environments Highlight gets initialized in if the projectId is passed as an environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>options <code>HighlightOptions</code> <code>optional</code></h5>
      <p>Configuration for Highlight client recording.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>backendUrl <code>string</code> <code>optional</code></h5>
          <p>Specifies the URL that Highlight will send data to. You should not use this unless you are running an on-premise instance. You may be interested in [Proxying](../getting-started/3_client-sdk/7_replay-configuration/proxying-highlight.md) to make sure your errors and sessions are not blocked by extensions.</p>
        </aside>
        <aside className="parameter">
          <h5>manualStart <code>boolean</code> <code>optional</code></h5>
          <p>Specifies if Highlight should not automatically start recording when the app starts. This should be used with H.start()  and H.stop() if you want to control when Highlight records. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>disableConsoleRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight records console messages. It can be helpful to set this to true while developing locally so you can see where console messages are being made in your source code. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>consoleMethodsToRecord <code>string[]</code> <code>optional</code></h5>
          <p>The value here will be ignored if disabledConsoleRecording is true. The default value is ['assert', 'count', 'countReset', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'table', 'time', 'timeEnd', 'timeLog', 'trace', 'warn'].</p>
        </aside>
        <aside className="parameter">
          <h5>reportConsoleErrors <code>boolean</code> <code>optional</code></h5>
          <p>If true, console.error calls will be logged as errors. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>enableSegmentIntegration <code>boolean</code> <code>optional</code></h5>
          <p>Allows patching of segment requests to enhance data automatically in your application (i.e. identify, track, etc.). The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>environment <code>string</code> <code>optional</code></h5>
          <p>Specifies the environment your application is running in. See [Environments](../general/6_product-features/3_general-features/environments.md) to see how setting the environment can help you move faster. The default value is production.</p>
        </aside>
        <aside className="parameter">
          <h5>networkRecording <code>NetworkRecordingOptions</code> <code>optional</code></h5>
          <p>Specifies how and what network requests and responses Highlight records. See [Recording Network Requests and Responses](../getting-started/3_client-sdk/7_replay-configuration/recording-network-requests-and-responses.md) for more information.</p>
        </aside>
        <aside className="parameter">
          <h5>version <code>string</code> <code>optional</code></h5>
          <p>Specifies the version of your application. See [Versioning Sessions](../getting-started/3_client-sdk/7_replay-configuration/versioning-sessions-and-errors.md) and [Versioning Errors](../getting-started/3_client-sdk/7_replay-configuration/versioning-sessions-and-errors.md) to see how setting the version can help you move faster.</p>
        </aside>
        <aside className="parameter">
          <h5>serviceName <code>string</code> <code>optional</code></h5>
          <p>Specifies the name of your application.</p>
        </aside>
        <aside className="parameter">
          <h5>privacySetting <code>'strict' | 'default' | 'none'</code> <code>optional</code></h5>
          <p>Specifies how much of the content Highlight should redact during recording. There are 3 levels of privacy:
          1. 'strict' - Redact all text and images on the page. This is the safest way to ensure you are not recording any personally identifiable information without having to manually add annotations to elements you don't want to be recorded.
          2. 'default' - Highlight will redact any text or input data that matches common regex expressions and input names of personally identifiable information. No images or media will be redacted.
          3. 'none' - All text and content will be recorded as it is displayed on the page.  
          See [Privacy](../getting-started/3_client-sdk/7_replay-configuration/privacy.md) to learn more about the privacy options. The default value is 'default'.</p>
        </aside>
        <aside className="parameter">
          <h5>integrations <code>IntegrationOptions</code> <code>optional</code></h5>
          <p>Specifies the configurations for the integrations that Highlight supports.</p>
        </aside>
        <aside className="parameter">
          <h5>enableCanvasRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight will record the contents of &lt;canvas&gt; elements. See [Canvas](../getting-started/3_client-sdk/7_replay-configuration/canvas.md) for more information. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>enablePerformanceRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight will record performance metrics (e.g. FPS, device memory).</p>
        </aside>
        <aside className="parameter">
          <h5>tracingOrigins <code>boolean | (string | RegExp)[]</code> <code>optional</code></h5>
          <p>Specifies where the backend of the app lives. If specified, Highlight will attach the X-Highlight-Request header to outgoing requests whose destination URLs match a substring or regexp from this list, so that backend errors can be linked back to the session. If true is specified, all requests to the current domain will be matched. Example tracingOrigins: ['localhost', /^\//, 'backend.myapp.com']</p>
        </aside>
        <aside className="parameter">
          <h5>recordCrossOriginIframe <code>boolean</code> <code>optional</code></h5>
          <p>Specifies that cross-origin iframe elements should be recorded. Should be set in both the parent window and in the iframe. See [cross-origin iframe recording](../getting-started/3_client-sdk/7_replay-configuration/iframes.md) for more details.</p>
        </aside>
        <aside className="parameter">
          <h5>urlBlocklist <code>string[]</code> <code>optional</code></h5>
          <p>Specifies a list of URLs to block <b>before</b> sending events to the Highlight back end. URLs can be fully-qualified or partial substring matches. Example: urlBlocklist: ["//www.high", "light.io"]</p>
        </aside>
        <aside className="parameter">
          <h5>inlineImages <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether to record image content. We default inlineImages to true on localhost and false on other domains. Inlined images that are otherwise only available on localhost can be sent to Highlight's servers and used in session replay; however, this can cause CORS errors. Explicitly set inlineImages to false to resolve CORS errors.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.init("&lt;YOUR_PROJECT_ID&gt;", {
          // Your config options here...
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.identify</h3> 
    <p>This method is used to add an identity to a user for the session. You can learn more in [Identifying Users](../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>identifier<code>String</code> <code>required</code></h5>
      <p>The identifier for the user in the session. This is often an email or UUID.</p>
    </aside>
    <aside className="parameter">
      <h5>metadata<code>[key: string]: string | boolean | number</code> <code>optional</code></h5>
      <p>Metadata for the user. You can think of these as additional tags for the user. If the highlightDisplayName or email fields are set, they will be used instead of identifier as the user's display name on the session viewer and session feed.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.identify("alice@corp.com", {
          highlightDisplayName: "Alice Customer",
          accountType: "premium",
          hasUsedFeature: true
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.track</h3> 
    <p>This method is used to track events that happen during the session. You can learn more in [Tracking Events](../getting-started/3_client-sdk/7_replay-configuration/tracking-events.md).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>eventName<code>String</code> <code>required</code></h5>
      <p>The name of the event.</p>
    </aside>
    <aside className="parameter">
      <h5>metadata<code>[key: string]: string | boolean | number</code> <code>optional</code></h5>
      <p>Metadata for the event. You can think of these as additional tags for the event.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.track("Opened Shopping Cart", {
          accountType: "premium",
          cartSize: 10
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.consumeError</h3> 
    <p>This method is used to send a custom error to Highlight.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error<code>Error</code> <code>required</code></h5>
      <p>A Javascript error that you have created or have access to.</p>
    </aside>
    <aside className="parameter">
      <h5>message<code>string</code> <code>optional</code></h5>
      <p>An additional message you'd like to add to the error to give the error more context.</p>
    </aside>
    <aside className="parameter">
      <h5>payload<code>{ [key: string]: string }</code> <code>optional</code></h5>
      <p>Additional metadata that you'd like to attach to the error to give the error more context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.consumeError(error, 'Error in Highlight custom boundary!', {
        component: 'JustThroughAnError.tsx',
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.metrics</h3> 
    <p>This method is used to submit custom metrics. </p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>metrics<code>Metrics[]</code> <code>required</code></h5>
      <p>A list of metrics that you'd like to report.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">metrics properties</aside>
        <aside className="parameter">
          <h5>name <code>string</code> <code>required</code></h5>
          <p>The name of the metric you are reporting.</p>
        </aside>
        <aside className="parameter">
          <h5>value <code>number</code> <code>required</code></h5>
          <p>The numeric value of the metric.</p>
        </aside>
        <aside className="parameter">
          <h5>tags <code>{ name: string; value: string }[]</code> <code>optional</code></h5>
          <p>A set of name,value pairs the represent tags about the metric. Tags can be used to filter and group metrics. See Frontend Observability for more details.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.metrics([{
        name: 'clicks',
        value: 1,
        tags: [{ browser }]
      }, {
        name: 'auth_time',
        value: authDelay,
        tags: [{ version: 'v2' }]
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.getSessionDetails</h3> 
    <p>This method is used to get the Highlight session URL. This method provides the same URL as H.getSessionUrl() but this also gives you a URL for the exact time (relative to the session recording) the method is called. For example, an error is thrown in your app and you want to save the Highlight session URL to another app (Mixpanel, Sentry, Amplitude, etc.). If you just want a URL to the session, you can save url. If you want a URL that sets the player to the time of when the error is called, you can save urlWithTimestamp.</p>
    <aside className="parameter">
      <h5>Returns <code>Promise&lt;{url: string, urlWithTimestamp: string}&gt;</code></h5>
      <article className="innerParameterContainer">
        <aside className="parameter">
          <h5>url <code>string</code></h5>
          <p>A URL for the session in Highlight.</p>
        </aside>
        <aside className="parameter">
          <h5>urlWithTimestamp <code>string</code></h5>
          <p>A URL for the session in Highlight, including the timestamp.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.getSessionDetails().then(({url, urlWithTimestamp}) => {
          console.log(url, urlWithTimestamp);
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.getSessionURL</h3> 
    <p>This method is used to get the Highlight session URL for the current recording session. This is useful to use if you'd like to send the session URL to another application. See H.getSessionDetails() if you want to get the URL with the current time.</p>
    <aside className="parameter">
      <h5>Returns<code>string<string></code></h5>
    </aside>
  </div>
  <div className="right">
    <code>
      const highlightSessionUrl = await H.getSessionURL();
 
      thirdPartyApi.setMetadata({
          highlightSessionUrl
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.start</h3> 
    <p>This method is used to start Highlight if H.init() was called with manualStart set to true.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options<code>StartOptions</code> <code>optional</code></h5>
      <p>Optional configuration parameters.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>forceNew <code>boolean</code> <code>optional</code></h5>
          <p>Setting this option will start a new recording session.</p>
        </aside>
        <aside className="parameter">
          <h5>silent <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether console.warn messages created in this method should be skipped.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.init("<YOUR_PROJECT_ID>", {
          manualStart: true
      });
 
      // Elsewhere in your app
      H.start({
          silent: false
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.stop</h3> 
    <p>This method is used to stop Highlight from recording. Recording can be resumed later by calling H.start().</p>
  </div>
  <div className="right">
    <code>
      H.init("<YOUR_PROJECT_ID>");
 
      // Elsewhere in your app
      H.stop();
    </code>
  </div>
</section>
