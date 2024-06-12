In highlight.io, you can search for a session by any of the data you send us (via the SDK)
throughout a session. The data you send us can be in the form of:

- track calls

- identify calls

- click data

This is done using search query, and we cover how
search/instrumentation for each type of these queries works below.

## Default search

By default, Highlight will show completed sessions that have been fully processed, `completed=true`. For newer
projects with less sessions, Highlight will show all sessions, and provide an example of how to use the search
query, `completed=(true or false)`.

## Default key

The default key for session search searches across multiple attributes. These columns include the user's identifier and
location. This could be the user's `email`, `device_id`, or given `identifier`,  as well as their `city` or `country`.

For example, if you enter an expression without a key (`highlight`) it will be used as the key for the following expression.

```
email=*highlight* OR city=*highlight*
```

## Track Searching
For track calls, you can search for sessions based on the properties that you gave to the track method. For example,
if you want to filter sessions out by the value of a tracked feature toggle, `FeatureFlag-Analytics`, then you can
use the the following query:

```
FeatureFlag-Analytics=true
```

## Identify Searching
For identify calls, you can search for sessions based on the properties that have a name of `identifier`, and the
value corresponds to the value sent to the first argument of `H.init` (see here). This
looks like the following query:

```
identifier=spencer@highlight.io
```

## Searching by User Clicks

When using Highlight, you might be interested in querying for sessions where a user clicked a certain HTML element.
Highlight records users' clicks on the page as two queryable properties: `clickSelector` and `clickInnerText`.

- `clickSelector` is the HTML Element's target's selector, concatinating the element's `tag`, `id ` and `class` values.

- `clickTextContent `is the HTML Element's target's `textContent` property. Only the first 2000 characters are sent.

You can then use the session filters to search for text in the two fields. An example of these queries are:

```
clickSelector=svg
clickTextContent="Last 30 days"
```

## Searching by Visited URL

You can also search for sessions based on the URL that the user visited. This is useful if you want to search for
sessions where a user visited a certain page on your site.

To perform this search, you can use the `visit-url` filter. An example of this query is:

```
visited-url="https://app.highlight.io/"
```

Since many urls contains the special characters, `:` and `=`, you can wrap the value in quotations to avoid any errors.

And like all of our filters, you can use contains, `=**`, and matches, `=//`, to help acheive the query you need. For
example, to get all sessions that visited the sessions page, we can use the following queries:

```
visited-url=*sessions*
visited-url=/.+\d/sessions.+/
```

## Autoinjected attributes

By default, Highlight's SDKs will autoinject attributes to provide additional context to help with searching for sessions.

| Attribute           | Description                                        | Example                                                                                                                                             |
|---------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `active_length`     | Time the user was active in milliseconds           | `10m`                                                                                                                                               |
| `browser_name`      | Browser the user was on                            | `Chrome`                                                                                                                                            |
| `browser_version`   | Browser version the user was on                    | `124.0.0.0`                                                                                                                                         |
| `city`              | City the user was in                               | `San Francisco`                                                                                                                                     |
| `completed`         | If the session is finished recording               | `true`                                                                                                                                              |
| `country`           | Country the user was in                            | `Greece`                                                                                                                                            |
| `device_id`         | Fingerprint of the user's device                   | `1018613574`                                                                                                                                        |
| `environment`       | The environment specified in the SDK               | `production`                                                                                                                                        |
| `first_time`        | If its the user's first session                    | `false`                                                                                                                                             |
| `has_comments`      | If someone has commented on the Highlight session  | `true`                                                                                                                                              |
| `has_errors`        | If the session contained linked errors             | `true`                                                                                                                                              |
| `has_rage_clicks`   | If the user rage clicked in the session            | `true`                                                                                                                                              |
| `identified`        | If the session successfully identified the user    | `false`                                                                                                                                             |
| `identifier`        | The idenifier passed to `H.init`                   | `1`                                                                                                                                                 |
| `ip`                | The IP address of the user                         | `127.0.0.1`                                                                                                                                         |
| `length`            | The total length of the session                    | `10m`                                                                                                                                               |
| `os_name`           | The user's operating system                        | `Mac OS X`                                                                                                                                          |
| `os_version`        | The user's operating system version                | `10.15.7`                                                                                                                                           |
| `pages_visited`     | The number of pages visited in the session         | `10`                                                                                                                                                |
| `sample`            | A unique order by to sample sessions               | `c1c9b1137183cbb1`                                                                                                                                  |
| `service_version`   | Version of the service specified in the SDK        | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                                          |
| `state`             | State the user was in                              | `Virginia`                                                                                                                                          |
| `viewed_by_anyone`  | If the session has been viewed by anyone           | `true`                                                                                                                                              |
| `viewed_by_me`      | If your account has viewed the session             | `false`                                                                                                                                             |

## Helpful tips

Use the `completed=false` to view live sessions.

Create a new `sample` of sessions by clicking "New Random Seed" for the sample's values.

Currently, length and active length are not supported by time suffixes, but this functionality is coming soon.

Use time suffixes, such as `s`, `m` and `h` to help filter out for length durations. For example, use `length>10m`
to find all sessions that were longer than 10 minutes.
