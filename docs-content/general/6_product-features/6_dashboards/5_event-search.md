---
title: Event Search
slug: event-search
createdAt: 2024-10-21T12:00:00.000Z
updatedAt: 2024-10-21T12:00:00.000Z
---

Event search lets you create metrics and alerts based on events within your sessions. While session search helps you find
sessions containing specific events, event search dives deeper by analyzing the attributes passed with each event and counting
occurrences, even if they happen multiple times in a session.  You can filter events using a
[search query](../../6_product-features/3_general-features/search.md). For example, you can get `Click` events produced in the
last 15 minutes service by selecting "Last 15 minutes" from the time picker and entering the following query:

```
event=Click
``` 

We also offer autocompletion to help you discover events and their attributes, as discussed below.


## Searching for Events

For general information on searching events, check out our [Search docs](../../6_product-features/3_general-features/search.md).

## Default Key

The default key for trace search is `event`. If you enter an expression without a key (`Navigate`) it will be used as the
key for the expression (`event=*Navigate*`).

## Searchable Attributes

You can search on any attributes that you send in your events as well as any of the default attributes assigned to a event.

Below is a table showing the autoinjected attributes for events:

| Attribute                       | Description                                        | Example                                                                                                                                 |
|---------------------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `browser_name`                  | Browser the user was on                            | `Chrome`                                                                                                                                |
| `browser_version`               | Browser version the user was on                    | `124.0.0.0`                                                                                                                             |
| `city`                          | City the user was in                               | `San Francisco`                                                                                                                         |
| `country`                       | Country the user was in                            | `Greece`                                                                                                                                |
| `environment`                   | The environment specified in the SDK               | `production`                                                                                                                            |
| `event`                         | Name of the event that occurred                    | `SessionsPageLoaded`                                                                                                                    |
| `first_session`                 | If its the user's first session                    | `false`                                                                                                                                 |
| `identified`                    | If the session successfully identified the user    | `false`                                                                                                                                 |
| `identifier`                    | The idenifier passed to `H.init`                   | `1`                                                                                                                                     |
| `ip`                            | The IP address of the user                         | `127.0.0.1`                                                                                                                             |
| `service_version`               | Version of the service specified in the SDK        | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                              |
| `session_active_length`         | Time the user session was active in milliseconds   | `10m`                                                                                                                                   |
| `session_length`                | The total length of the user session               | `10m`                                                                                                                                   |
| `session_pages_visited`         | The number of pages visited in the session         | `10`                                                                                                                                    |
| `os_name`                       | The user's operating system                        | `Mac OS X`                                                                                                                              |
| `os_version`                    | The user's operating system version                | `10.15.7`                                                                                                                               |
| `secure_session_id`             | Id of the session the event occurred in            | `e1845285cb360410aee05c61dd0cc57f85afe6da`                                                                                              |
| `state`                         | State the user was in                              | `Virginia`                                                                                                                              |

You can view a full list of the available attributes to filter on by starting to type in the search box. As you type you'll get
suggestions for keys to filter on.

## Special Events

The Highlight SDK records a few events by default: Click and Navigate events, both of which have some attributes associated with them.
The event search form helps navigate these attributes with additional inputs, but all can be used directly in the search query.


### Click Events

Click Events are triggered by mouse-down actions, even on non-clickable elements (like headers or white space). Click events have 3 main
attributes associated with it:
 - `clickTextContent`: The text of the content that was clicked.
 - `clickTarget`: The HTML element that was clicked.
 - `clickSelector`: The full HTML path to the clicked element.

 ### Navigate Events

Navigate events are triggered by URL changes, including reloads. Navigate event attributes are URLs, and key types include:
 - `exit_page`: The user ended the session on this url.
 - `landing_page`: The user landed on this url.
 - `reload`: The user reloaded the page on this url.
 - `url`: The user navigated to this url.

## Helpful Tips

### Digging Deeper into Events

If you want to get the number of unique sessions, edit the function to CountDistinct by secure_session_id. If you would like the number
of unique users, use CountDistinct with the identifier attribute.

### Funnels

Event search also allows you to view relations of events in the form of funnels. Select the `Funnel Chart` view type to start
seeing how many sessions include multiple events in steps.