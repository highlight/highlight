---
heading: Log Search Specification
title: Log Search
slug: log-search
createdAt: 2021-09-10T17:54:08.000Z
updatedAt: 2024-05-15T00:00:00.000Z
---

Logs are broken down into two discrete concepts: **messages** and **attributes**. Given the following log:

```
logger.info('Queried table', {
  table: 'users',
  query: 'hello',
}),
```

The log message is `Queried table` and the attributes are `table:users` and `query:hello`.

## Searching for logs

For general information on searching logs, check out our [Search docs](../../6_product-features/3_general-features/search.md).

## Default Key

The default key for log search is `message`. If you enter an expression without a key (`graphql request`) it will be used as the
key for the expression (`message="*graphql request*"`).

For example given the following log:

```
log.info("excluding session due to no user interaction events")
```

We can find this log by typing `excluding session due to no user interaction events`.

![](/images/log-search.png)

## Autoinjected attributes

By default, Highlight's SDKs will autoinject attributes to provide additional context as well as assisting in linking [sessions](../1_session-replay/) and [errors](../2_error-monitoring/) to their respective logs.

| Attribute           | Description                                        | Example                                                                                                                                             |
|---------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `code.filepath`     | File path emitting the log.                        | `/build/backend/worker/worker.go`                                                                                                                   |
| `code.function`     | Function emitting the log.                         | `github.com/highlight-run/highlight/backend/worker.(*Worker).Start.func3`                                                                           |
| `code.lineno`       | Line number of the file where the log was emitted. | `20`                                                                                                                                                |
| `environment`       | The environment specified in the SDK               | `production`                                                                                                                                        |
| `host.name`         | Hostname                                           | `ip-172-31-5-211.us-east-2.compute.internal`                                                                                                        |
| `level`             | The log level                                      | `info`                                                                                                                                              |
| `message`           | The log message                                    | `public-graph graphql request failed`                                                                                                               |
| `os.description`    | Description of the operating system                | `Alpine Linux 3.17.2 (Linux ip-172-31-5-211.us-east-2.compute.internal 5.10.167-147.601.amzn2.aarch64 #1 SMP Tue Feb 14 21:50:23 UTC 2023 aarch64)` |
| `os.type`           | Type of operating system                           | `linux`                                                                                                                                             |
| `secure_session_id` | Session id that contains this log                  | `wh1jcuN5F9G6Ra5CKeCjdIk6Rbyd`                                                                                                                      |
| `service_name`      | Name of the service specified in the SDK           | `private-graph`                                                                                                                                     |
| `service_version`   | Version of the service specified in the SDK        | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                                          |
| `source`            | Broad origin of the log                            | `backend`                                                                                                                                           |
| `span_id`           | Span id that contains this log                     | `528a54addf6f91cc`                                                                                                                                  |
| `trace_id`          | Trace id that contains this log                    | `7654ff38c4631d5a51b26f7e637eea3c`                                                                                                                  |

## Helpful Tips

Use the `secure_session_id EXISTS` search to filter out all logs that are not tied to a session.