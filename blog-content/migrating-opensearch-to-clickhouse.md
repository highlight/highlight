---
title: 'Migrating from OpenSearch to Clickhouse'
createdAt: 2023-10-18T00:00:00.000Z
readingTime: 10
authorFirstName: Zane
authorLastName: Mayberry
authorTitle: Software Engineer @ Highlight 
authorTwitter: ''
authorWebsite: ''
authorLinkedIn: 'https://www.linkedin.com/in/zane-mayberry-688161165/'
authorGithub: 'https://github.com/mayberryzane'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FvrMpBimsRzOGGJSWWppg&w=1920&q=75'
tags: Launch Week 3
---

# Migrating from OpenSearch to Clickhouse

In Highlight, users can search for sessions and errors based on their metadata - this includes user identifiers, visited URLs, custom events, and many other properties. Highlight’s search allows users to combine as many of these filters as needed to narrow down the sessions or errors they’re looking for. Highlight also supports different operator types, such as substring search, regex matching, inverting the results with the “not” operator, and numeric comparators.  

Highlight’s primary data store is Postgres. When it comes to creating a session or error for the first time, or querying / updating its metadata by unique id, Postgres is performant enough. However, it is not as well suited to querying for records based on arbitrary attributes. Because Highlight’s search allows users to pick which fields and operators to use in their search, it wouldn’t be possible to design a Postgres index to generically speed up all queries, and as a result, searching in Postgres would require a full scan over all sessions / errors within a given time range. As some workspaces can ingest millions of sessions or errors per week, a worst case query that matches very few of these records could require scanning millions of rows before returning a result, which would be prohibitively slow.  

We originally used OpenSearch as a solution to this. OpenSearch stores each field in an inverted index, so that a query can find all matching documents within each index and intersect the results. This works pretty well on exact keyword searches and was originally performant enough for the more complicated substring and regex searches, especially compared to full table scans in Postgres. However, as our customer base has grown, the time taken for certain searches increased dramatically. In our own workspace, substring searches such as sessions with a URL containing “app.highlight.io” were taking more than 15 seconds. Additionally, OpenSearch performance is dependent on the amount of memory available to the cluster, and supporting this was costly.  

## Clickhouse Advantages

Clickhouse is a column oriented database. A typical Highlight workspace may use 50 session field types, but if a query uses one or two of these to filter, Clickhouse will only load the relevant columns from storage. Clickhouse uses a sparse primary index to filter out large blocks of irrelevant records, and is optimized for quickly scanning through the remaining records. This aligns with our session and error searches, which enforce a date filter, sort the results by date, and use complicated queries like regex matching which cannot (in general) be improved by using an index.  

Clickhouse also supports [materialized views](https://clickhouse.com/docs/en/guides/developer/cascading-materialized-views), which behave like write triggers in a traditional database. They can be used to aggregate data to speed up query performance. For our use case, we found these helpful for field autocomplete suggestions. In our original OpenSearch implementation, we recorded the first time a field was used, but nothing else. With Clickhouse, we could keep track of the number of times a field was used per day, then when suggesting fields, we could filter for only fields that exist in the search range and order them by decreasing frequency to improve our suggestions’ relevance.  

We had already adopted [Clickhouse for log storage](https://www.highlight.io/blog/how-we-built-logging-with-clickhouse) and it seemed like the best candidate for an OpenSearch replacement. After a POC to test search performance in our own workspace, we decided to migrate all sessions and errors from OpenSearch to Clickhouse.  

## Data Modeling

There are some unique requirements with Clickhouse when compared to other databases. One of the big differences is that [mutations are expensive](https://clickhouse.com/docs/en/guides/developer/mutations). In our data model, when a session is “live”, session metadata can be updated many times as new events are recorded. To handle this in Clickhouse, we chose to use a [`ReplacingMergeTree`](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replacingmergetree) and rewrite all session metadata whenever an update happens. At query time, we can use the `FINAL` keyword to ensure we are viewing the latest metadata.  

Unlike most relational databases, in Clickhouse there’s a big difference between a table’s sparse primary index and secondary (data skipping) indexes. In order to get the best performance, queries should be able to use the primary index to filter out as many rows as possible. In Highlight’s searches, start and end dates are required input, and results are sorted based on their date, which intuitively translates to using the session / error date as a primary key (plus ID as a tiebreak). Searches for small time ranges will be very fast as results outside the time range can be filtered out quickly compared to the time it would take to scan over them.  

One of OpenSearch’s biggest advantages is its ability to handle semi-structured data. In Highlight, users can arbitrarily add custom metadata to their sessions. In OpenSearch, we were able to add these as an array on each session, and querying on these was about as fast as querying based on a top-level field. This didn’t translate as well to Clickhouse. Using the `Map` data type, we could store metadata key-value pairs in a new column, but querying was slow for workspaces with lots of custom metadata, because loading the values for a single key requires loading the entire `Map` column, even though most keys aren’t needed. To get around this, we used a separate table and added the custom metadata key to the primary key. When a query uses this custom metadata, we can filter for only this key in a subquery, resulting in performance near what it would be if these keys were individual columns. One downside with this implementation is that the query requires all matching fields to be scanned before filtering out results from the sessions table. At our current scale, this has been performant enough, but if we have to revisit this in the future, Clickhouse supports alternate join algorithms like [full sorting merge join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#full-sorting-merge-join) which could avoid this.  

## Keeping Data in Sync

One of the problems to solve with any secondary data store is how to keep the information up-to-date with our Postgres source of truth. In our original implementation, we dual-wrote to OpenSearch whenever any session or error metadata was added or updated in Highlight. Because the Postgres update would happen before the OpenSearch update, in the case of a failure, there was a chance that data could be written to Postgres but not OpenSearch. To address this, we logged the ids of any failed sessions or errors so that we could retry these later.  

This original approach had some issues - if a field was updated in more than one place concurrently, there was no guarantee that the latest update sent to OpenSearch matched the latest update in Postgres. To avoid race conditions, we would have needed to load the latest state of each session whenever it is updated, or maintain a sequence number in Postgres in order to reject any out-of-order OpenSearch updates.  

We already [use Kafka for events ingest](https://www.highlight.io/blog/scalable-data-processing-with-apache-kafka), so we chose to piggyback on our existing infrastructure by creating a new Kafka topic to handle data syncing. When session or error metadata is updated, we write the id of that session or error to this new topic. Then we have a separate worker reading from this topic that loads a batch of these records in one bulk query from Postgres and writes one bulk insert to Clickhouse. With this architecture, there may be a delay between the Postgres and Clickhouse updates, but we’re guaranteed eventual consistency and able to retry in case of any failures.  

## Results

We had a lot of success with our new Clickhouse-based search backend. In our own workspace, complex queries (e.g. “visited URL contains ‘app.highlight.io’”) decreased from 15 seconds to less than 1 second. Using Clickhouse’s materialized views, we were able to improve the relevance of field suggestions by filtering out fields that haven’t been used in the time range and ordering them by frequency. Finally, we were able to decrease our monthly spend and simplify our architecture by terminating our OpenSearch cluster.  
