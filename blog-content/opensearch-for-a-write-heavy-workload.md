---
title: Configuring OpenSearch for a Write-Heavy Workload
createdAt: 2022-08-11T12:00:00.000Z
readingTime: 7
authorFirstName: Zane
authorLastName: Mayberry
authorTitle: Software Engineer
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/zane-mayberry-688161165/'
authorGithub: 'https://github.com/mayberryzane'
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FvrMpBimsRzOGGJSWWppg&w=1920&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FuKzLb5AQZfhI5DgzFYEQ&w=1920&q=75
tags: Engineering
metaTitle: 'How-To: Configure OpenSearch for a Write-Heavy Workload'
---

## Background

Originally, sessions and errors search on Highlight queried Postgres since that is our primary database for storing all Highlight metadata. We allowed users to filter on each session or error object field.

Unfortunately, we started running into performance issues with more complicated queries once the number of sessions and errors increased. Covering all combinations of the queried fields with an appropriate index was challenging, so when we decided to improve our search experience, we knew we wanted to find a datastore that:

- would scale well without having to manually manage and tune a lot of indexes, and
- would be flexible enough that adding more fields in the future would not require us to rewrite queries.

Given these criteria, OpenSearch was our top candidate.

## Initial Observations

For our proof of concept, we created an OpenSearch cluster and copied over all sessions and errors objects from Postgres to test queries against it. We saw a fairly significant improvement in query performance; queries that were previously taking a couple of seconds were now taking a couple of hundred milliseconds.

More importantly, adding more filters to the query did not have a noticeable impact on performance, which was an ideal outcome for the flexible query builder we planned to build.

## Learnings

### Join Data Type

For large objects that are updated frequently, consider modeling the updates as child fields with the `join` data type. For Highlight, this was critical to getting good performance while indexing errors.

In Highlight, each error can have many _instances_, which are specific cases where the same error was thrown. We wanted to allow users to query fields on the error (i.e., errors with the message “null pointer exception”) as well as the instance (i.e., errors thrown between 12 pm and 12:30 pm).

Originally, we modeled this in the canonical OpenSearch way: each error was a single document with an array of error instances as a field in that document.
```
{
  id: "error_123",
  message: "null pointer exception",
  ...
  instances: [
    {id: "instance_1", time: "10/27/21 10:00:32"},
    {id: "instance_2", time: "10/27/21 11:30:46"},
    {id: "instance_4", time: "10/27/21 12:04:31"},
    {id: "instance_5", time: "10/27/21 12:05:19"},
    ...
    {id: "instance_100000", time: "02/27/22 02:48:19"}
  ]
}
```
We quickly ran into performance issues when updating commonly thrown errors. For example, if an error has 100,000 instances, an update to add one more instance requires rewriting the entire multi-megabyte document. As new instances are added, performance is essentially O(n^2) with respect to the number of objects in the instance array. The impact was visible in the OpenSearch metrics as high CPU usage and throttling via HTTP 429 errors during indexing. Despite our efforts of increasing the cluster size and setting up read replication, a sudden burst of error instances could spike CPU usage at any time.

Our solution to this was to use the `join` data type to tag errors as parent documents and instances as their children, and save both errors and instances as top-level documents in the same index.
```
{
  id: "error_123",
  message: "null pointer exception",
  join: {
    name: "parent",
  }
},
{
  id: "instance_1",
  time: "10/27/21 10:00:32",
  join: {
    name: "child",
    parent: "error_123",
  }
},
{
  id: "instance_2",
  time: "10/27/21 11:30:46",
  join: {
    name: "child",
    parent: "error_123",
  }
}
```
Now, when adding a new error instance, we can index a single child document without having to update the parent error. Updates to the parent error are also less resource intensive since the document size is much smaller without the error instances as part of it.

The possible downside is slower query performance. A query on the error instance date, for example, requires us to use OpenSearch’s `has_child` query to find all parents with children matching specific criteria. When testing this new approach, we found query times to be reasonable. They doubled the previous time, but were still only a few hundred milliseconds, which we determined to be a good tradeoff to make for the much-improved resource usage.

<BlogCallToAction />

### Compound Fields

There are some cases where it’s helpful to combine fields at index time to simplify and improve performance at query time. In Highlight, sessions can have user and track properties. These are represented as key-value pairs, with the property type as the key and the property’s value as the value, e.g. for a user property `user.email = [zane@highlight.io](<mailto:zane@highlight.io>)`, `user.email` is the key and [`zane@highlight.io`](mailto:zane@highlight.io "mailto:zane@highlight.io") is the value. If these were transformed into JSON objects and indexed in OpenSearch, each session would have an array of properties with key and value fields. However, because of the way documents are stored in OpenSearch, the properties objects would be flattened as follows:
```
{
  id: "session_123",
  ...
  properties.key: ["user.email", "user.name"],
  properties.value: ["zane@highlight.io", "Zane Mayberry"]
}
```
As a result, we would not be able to query specific combinations of key-value pairs.

OpenSearch has support for `nested` fields, which are internally represented as separate documents. This would correctly allow for queries like `key = "user.email" AND value = "zane@highlight.io"`, however, this would likely have similar performance impact as the parent-child join in errors.

An easier way to accomplish the same thing with no performance impact is to combine key-value pairs in the same field, as follows:
```
{
  id: "session_123",
  ...
  properties.key: ["user.email", "user.name"],
  properties.value: ["zane@highlight.io", "Zane Mayberry"],
  properties.keyValue: ["user.email;zane@highlight.io", "user.name;Zane Mayberry"]
}
```
If the separator chosen cannot be part of the key name, there will not be any ambiguity. The query would simply become `keyValue = "user.email;zane@highlight.io"`. And since we retain the original `key` and `value` fields, we can still support other types of queries, like existence checks for property keys or searching across all values regardless of type.

Although we don’t have a formal benchmark for the impact of using compound fields in OpenSearch, we would approximate the impact to be similar to parent-child joins (2x faster).

### Index Refresh

On Highlight, we were seeing slow query performance the first couple times a page was loaded. After some testing, it became clear that after the 5th refresh, performance was much better. The number 5 was suspiciously the same as our shard count, so we investigated to see if there was anything that we could tune for our use case.

After receiving data, OpenSearch needs to refresh the indexes for the new data to become visible to any querying threads. By default, this refresh happens every 1 second. However, and also by default as a performance optimization, if a shard has not been queried for over 30 seconds, it will defer the refresh until the next time the data is queried. This reduces resource usage during indexing, and according to the docs, was added specifically to improve bulk indexing performance. However, this requires your web app to be querying at least once per shard every 30 seconds to keep the index refreshed. If there’s not enough traffic, for example during off-peak hours, queries ca
