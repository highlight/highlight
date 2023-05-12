# RFC: Session/Error Feeds ClickHouse Migration

* Status: In Progress
* Author: [@Vadman97](https://github.com/Vadman97)

## Summary

This RFC describes how we will migrate the Session/Error Feeds from OpenSearch to ClickHouse.
We'll also discuss how we can entirely stop using OpenSearch.
As part of this change, we will stop using InfluxDB for Error Group metrics.

## Motivation

See [PRD: Session/Error Feeds ClickHouse Migration](../prds/002-feed-clickhouse-migration.md).

## Proposed Implementation

The migration from OpenSearch to ClickHouse will happen in a few phases:
1. Replace the Error feed queries with ClickHouse
2. Replace the Error Group metrics with ClickHouse
3. Replace the Session feed queries with ClickHouse
4. Implement CommandBar improvements using ClickHouse

## Database modeling

As a starting point, the database schema can be similar to the current postgres schema for sessions and errors. 
However, we'll need to benchmark the performance of different approaches for querying sessions and errors in ClickHouse. 
Ie.
1. having 3 separate tables matching what’s stored in Postgres and join them at query time
2. denormalize fields and save a copy of their values with each session/error (as we do with OpenSearch)
3. treat queryable session/error columns as fields too and denormalize with a format like (field_type, field_name, field_value, id), then look up the full session/error objects in postgres after getting ids from clickhouse

Migrating data should be straightforward with a ClickHouse query as per [this blog](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres).
We can start by copying the current PostgreSQL schema and determining what the ClickHouse SQL queries replacing the OpenSearch queries will look like.
We can then create a copy of the error groups table in ClickHouse which denormalizes the fields into a map column type, and benchmark the updated queries.
Lastly, we can create another copy to see if the third schema is a performant option. The benefit of option #3 is that postgres can continue to be
the source of truth for error group data, but we should consider if ClickHouse can be the long-term source of truth for write-once metadata.

## Success Metrics

* The features listed in the [PRD](../prds/002-feed-clickhouse-migration.md) are implemented.
* The performance of session, errors, and command bar searches is better than currently with OpenSearch. A goal here is for all worst-case queries to take less than 1 second.
* The OpenSearch cluster is shut down, and the cost of storing and querying the same data in ClickHouse is less than the current cost of OpenSearch.
* We will reduce our usage of InfluxDB with the longer term goal of removing the InfluxDB dependency entirely.

## Drawbacks

* This migration can take a lot of engineering effort. We are not sure which schema for the data will work best for our use-case. 
* Optimizing ClickHouse query performance is still relatively new to us.
* We'll be writing new types of ClickHouse aggregation queries which we are not as familiar with.
* However, we'll be able to deprecate OpenSearch and save time currently spent when looking at performance issues.

## Open Questions

Since ClickHouse [does not support high-volume updates](https://clickhouse.com/docs/en/guides/developer/mutations) to rows, we would not want to use ClickHouse as the source of truth for session updated / processed states. However, we could re-architect our session processing logic to store that frequently-modified data in Redis while storing final records in ClickHouse.

## Rollout + Adoption

1. Migrate sessions and error groups from PostgreSQL to ClickHouse by using the [cross-db insert workflow](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres).
   1. Define a schema that would make sense for the features described in the [PRD](../prds/002-feed-clickhouse-migration.md).

