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
- `level:info` matches every log with level `info`

### Wildcard search

To perform a wildcard search, use the `*` symbol:

- `service:frontend*` matches every log that has a service starting with `frontend`
- `frontend*` matches all log messages starting with the word `frontend`
- `*frontend` matches all log messages ending with the word `frontend`

## Autoinjected attributes

By default, Highlight's SDKs will autoinject attributes to provide additional context as well as assisting in linking [sessions](../1_session-replay/) and [errors](../2_error-monitoring/) to their respective logs.

![](/images/log-search-table.png)
