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
