---
title: "Day 2: Supercharging the Highlight Query Builder"
createdAt: 2024-01-30T12:00:00Z
readingTime: 3
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/launch-week/4/d2-splash.png'
tags: Launch Week 4
metaTitle: "Day 2: Supercharging the Highlight Query Builder"
---

## Parsing Biggish Data

It's not Big Data™ by any means, but Highlight generates a figurative avalanche of observability data every single day.

We recently added Traces to our portfolio, multiplying our database rows yet again.

Our ClickHouse database has powerful search and filtering tools, but we've got to surface those to you, our users.

## A Custom Query Language

At Highlight, we believe in cleaning up after ourselves. We cleaned up this mess with our own little query language, along with an interpreter that we can run on the client or the server.

We've enhanced the Highlight Query Builder to support numeric filtering and intricate query structures involving `NOT` and `OR` clauses.

The beauty of our query language lies in its isomorphic nature, seamlessly functioning from server to client. This not only improves performance but also lays a solid groundwork for future expansion.

## Benefits

1. **Advanced Numeric Filtering**: Need to filter data beyond a certain threshold? Simply use operators like `>`, `<`, `<=`, and `>=`. For example, to find spans that take longer than 10µs, type `duration>10000`.

2. **Enhanced Logical Operations**: Our Query Builder supports `NOT` and `OR` operators, along with grouping statements. For instance, you can easily construct a query like `service_name=private-graph OR (status>=400 service_name=public-graph)`.

3. **Client-Side Query Validation**: Experience immediate feedback with client-side query validation. This feature enhances user experience by enabling quick troubleshooting and ensuring query accuracy.

4. **Autocomplete for Operators**: Discover and use operators with our new autocomplete feature. This addition supports operators like `=`, `!=`, `>`, `<`, `<=`, `>=`, making query construction more intuitive.

5. **Syntax Highlighting for Complex Queries**: No more getting lost in complicated queries. Our enhanced syntax highlighting feature ensures that even the most complex queries are easy to read and understand.
