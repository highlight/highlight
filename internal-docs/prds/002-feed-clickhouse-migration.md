# PRD: Session/Error Feeds ClickHouse Migration

* Status: In Progress
* Author: [@Vadman97](https://github.com/Vadman97)

## Goals

Highlight uses OpenSearch to power the session feed and error feed within the product. OpenSearch
powers the query-builder filtering that efficiently finds sessions and errors.

We'd like to maintain the features while migrating to ClickHouse to save cost in storing and querying
this data while improving the performance of queries. New features are prefixed with new:

- Error feed
  - shows all possible attributes to search on
  - once a search attribute is selected, shows all possible values for the attribute
  - supports exact and like matching for attributes + and/or logic between attributes
  - shows a histogram of errors over time for the current query
  - for each error group, shows a distribution of occurrences of instances within the group.
  - once an error group is selected, shows a distribution of occurrences
  - new: shows a list of error instances within a group with the ability to filter instances by attributes
    - for a preset of attributes, once one is picked, show all possible values for that search attribute
- Session feed
  - shows all possible attributes to search on
  - once a search attribute is selected, shows all possible values for the attribute
  - supports exact and like matching for attributes + and/or logic between attributes
  - shows a histogram of sessions over time for the current query, grouped by an attribute (default - has/no-has errors)
  - new: for each session, shows a distribution-preview of events over time (grouping by errors, track events, etc.)
- Command bar
  - Searching for sessions and errors based on predefined attributes: email, identifier, url, os, browser
  - new: using the input to predict the type of query that makes more sense (session vs. error vs. log)

## User Feedback

This feature is motivated by poor performance of OpenSearch queries (cold-start query start can take >5 seconds)
and the growing costs of storing all session and error metadata in OpenSearch.
