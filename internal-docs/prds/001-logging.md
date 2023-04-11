# PRD: Logging

* Status: Accepted
* Author: @et

## Goals

In Q4 of 2022, Highlight built out an [error monitoring](https://errors.highlight.io/) solution as it pivots towards becoming the full stack monitoring solution for developers. Currently, an error on Highlight links out to the associated session replay to assist developers solving bugs and logging is the next natural extension to that.

- Log ingestion - how the customer will send Highlight their logs
- Log viewing - how the user will view logs in Highlight
- Log filtering - how the user will filter logs
- Log alerting - triggering alerts when filtered logs reach a certain threshold

## User Feedback

> If this feature is driven by user feedback, link out examples.*

## Competitor Analysis

[**Logtail**](https://betterstack.com/logtail)

**Pros:**

- Extremely simple UX
- Great onboarding for data sources

**Cons:**

- Log explorer pulls you into Grafana instead of something more native to their UX.

[**Axiom**](https://axiom.co/)

**Pros:**

- Uses a custom datastore that allows an [insane amount](https://www.axiom.co/99) (5TB) of data ingest with a 90 day retention.

**Cons:**

- Have to learn a [new language](https://www.axiom.co/docs/apl/introduction) to really harness the power.

[**logz.io**](https://logz.io/)

**Pros:**

- SOC2, PCI, HIPAA, and GDPR compliant

**Cons:**

- Feels disjointed trying to combine many open source tools

## Pricing

Our pricing structure will be dependent on what the log ingest and log retention period is. This will be revisited after an RFC is formulated to suss out the details of the underlying datastore.

## What we are building

### Log ingestion

Customers should not have to adjust their application code to get logs to us. This means that if they’re using the popular logging library, `winston`, for their Node.JS backend, they should be be able to emit those logs via `winston` [transports](https://github.com/winstonjs/winston#transports). 

```jsx
import { HighlightTransport } from "@logtail/highlight";
import winston from "winston";

// Create a Winston logger - passing in the Highlight transport
const logger = winston.createLogger({
  transports: [new HighlightTransport()],
});

// Log as normal in Winston - logs should be synced to highlight.io
logger.log({
  level: "info"
  message: "Some message"
});
```

Most popular libraries offer a similar hook framework.

Examples:

- [Logtail](https://github.com/logtail/logtail-js/tree/master/packages/winston)
- [Uptrace](https://github.com/uptrace/opentelemetry-go-extra/tree/main/otellogrus)

**Hydrating session ids**

Logs in Highlight will have the most value if they can be linked to an error. In order for that to happen, the `secure_session_id` should be included in the log message. This likely will only make sense when using our SDKs middleware.

**Logging support**

We should support hooks for the following logging libraries in our supported SDK languages.

- **Go**
    - [logrus](https://github.com/sirupsen/logrus)
    - [zap](https://github.com/uber-go/zap)
- **Server side Javascript**
    - [winston](https://github.com/winstonjs/winston)
- **Client side Javascript**
    - [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
    - [console.info](https://developer.mozilla.org/en-US/docs/Web/API/console/info)
    - [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/console/warn)
- **curl**
- Vercel

**Unstructured logging**

Ideally, every log that comes in will be in a [structured log](https://www.loggly.com/use-cases/what-is-structured-logging-and-how-to-use-it/) format. Anything that comes in an unstructured log format (e.g. `console.log` ) should be converted on the backend to a structured format, e.g.

```jsx
console.log('hello world')
// stored as { dt: DATETIME, message: "hello world" }
```

### Log viewing

In Highlight, we should have a top level menu item for viewing all logs for a given project. The viewer should:

- Collapse structured logs and show minimal data for each line
- Each log line should be clickable to uncollapse logs and show the full log payload
- Each log line should be deep linkable
- Be realtime similar to `tail -f`

**Error logs**

When a `secure_session_id` is present for a log, we should have a space for each applicable error instance to show matching logs.

**Logs to sessions**

Given a log, if a session id is present, we should find a way to jump to a session.

**Session logs**

Given a session, we should be able to show all the logs associated with that session.

### Structured log format 🆕

All logs need to be normalized into the OTEL data model and injected with as much data as we can through our SDKs.

```json
{
  "timestamp": "023-02-06T12:33:31.279-07:00",
  "body": "something happened",
  "attributes": {
    "foo": "bar",
  },
  "severity_text": "info"
  "trace_id": "uuid",
  "span_id": "uuid",
}
```

| Property | Type | Required | Filterable |
| --- | --- | --- | --- |
| timestamp | datetime | Yes | Yes |
| body | string | Yes | Yes |
| attributes | map[string]string | Yes (but can be empty) | Yes |
| severity_text | enum (debug | info | warn | error | fatal) | Yes (defaults to info) | Yes |
| trace_id | string | Yes | No |
| span_id | string | Yes | No |

### Log filtering

The log viewer should have the ability to filter logs. For example, given the following logs:

```jsx
{ email: "vadim@highlight.io", message: "logged in" }
{ email: "eric@highlight.io", message: "logged out" }
{ email: "chris@highlight.io", message: "is idle" }
```

the following query:

```jsx
email:eric@highlight.io
```

would return the following logs:

```jsx
{ email: "eric@highlight.io", message: "logged out" }
```

The applicable filters should be generated given all the logs passed in to a given project.

**Multiple filters**

More than one filter should be usable. When used together, we should treat them as an `AND` operation.

**Time filtering**

Logs should be able to filtered by a given time frame. Our UX will provide quick actions to use relative time frames (e.g. last 5 minutes) but we should be able to fetch any log given any time frame as long as it’s within the log retention period.

**Log segments**

Filters should be savable as a segment similar to how session and error filters works.

### Log alerting

A new alert type should be created for segments. These should operate similar to our existing metric monitor alerts.

`Alert me when the filter ${filterStr} has more than ${threshold} within ${period}` 

example:

`Alert me when the filter "eric@highlight.io" has more than 1 line within 5 minutes`

## What are we not building

These are open items that we feel are not important to do for our MVP. However, we list them here for future opportunities after we attain user adoption.

- Collecting logs beyond code
- Complex filtering beyond an `AND` filter. See what others do:
    - [https://www.axiom.co/docs/apl/introduction](https://www.axiom.co/docs/apl/introduction)
    - [https://help.sumologic.com/docs/search/search-query-language/](https://help.sumologic.com/docs/search/search-query-language/)
- Log visualizations
- Log drop filters
- Facets (i.e. Datadog’s left sidebar on their logs page)
- Defining a source for logs

## Other Considerations

- It may be a good idea to pipe existing “log” data (namely, console logs) to the logging product so that:
- Customers get a sense of what the logging product does before sending backend logs.
- We have a way to battle test the logging implementation against reasonable traffic.
- We’re not blocked by the work being done on the OTEL end.