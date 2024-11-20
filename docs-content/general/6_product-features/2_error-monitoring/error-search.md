---
title: Error Search
slug: error-search
createdAt: 2024-05-15T00:00:00.000Z
updatedAt: 2024-05-15T00:00:00.000Z
---

In [highlight.io](https://highlight.io), you can search for a errors using different attributes on the error group and error
instance. The instance is a specific occurance of an error that occurred. Based on the error event, stacktrace, and other attributes,
instances are organized into groups. These groups are returned by the search on the [Errors search page](https://app.highlight.io/errors).

## Searching for Errors

For general information on searching errors, check out our [Search docs](../../6_product-features/3_general-features/search.md).

## Default Key

The default key for error search is `event`. If you enter an expression without a key (`undefined variable`) it will be used as the
key for the expression (`event="*undefined variable*"`).

To search for a error event, simply type the text of the message. Given the following error:

```
sql: statement is closed
```

We can find this error by typing `sql: statement is closed`.

### Error Instance Search

The error instances of a specific group and be searched as well. By clicking the "See all instances" button, you can search across
instances to get more information on different occurrences of the error group.

![](/images/error_instance_search.png)

## Autoinjected Attributes

Errors can be searched by the following attributes:

| Attribute           | Description                                        | Example                                                                                                                                             |
|---------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `browser`           | User's browser                                     | `Chrome`                                                                                                                                            |
| `client_id`         | Client id associated with the session              | `DQbQCEHN0FLuwCeW50AeLI0cH6C4`                                                                                                                      |
| `environment`       | The environment specified in the SDK               | `production`                                                                                                                                        |
| `event`             | Title of the error                                 | `sql: statement is closed`                                                                                                                          |
| `has_session`       | If the error is tied to a session                  | `true`                                                                                                                                              |
| `secure_session_id` | Id of the session                                  | `wh1jcuN5F9G6Ra5CKeCjdIk6Rbyd`                                                                                                                      |
| `service_name`      | Name of the service specified in the SDK           | `private-graph`                                                                                                                                     |
| `service_version`   | Version of the service specified in the SDK        | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                                          |
| `status`            | Status of the error group                          | `RESOLVED`                                                                                                                                          |
| `tag`               | Tag applied to error                               | `database error`                                                                                                                                    |
| `trace_id`          | Trace id that contains this log                    | `7654ff38c4631d5a51b26f7e637eea3c`                                                                                                                  |
| `type`              | Broad type of the error                            | `React.ErrorBoundary`                                                                                                                               |
| `visited_url`       | URL where the error occurred                       | `https://app.highlight.io/1/errors`                                                                                                                 |

## Helpful Tips

Use contains, `=**`, and matches `=//` operators when searching by `visited_url` to avoid being too limited by query params.
See [Searching by Visited URL](../1_session-replay/session-search.md#searching-by-visited-url) for more information.