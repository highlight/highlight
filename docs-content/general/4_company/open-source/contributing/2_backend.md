---
title: GraphQL Backend
slug: backend
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Frequently Asked Questions

### How do I migrate schema changes to PostgreSQL?
Schema changes to [model.go](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L1) will be automigrated. New tables should be added to [Models](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L133-L187). [Migrations happen automatically](https://github.com/highlight/highlight/blob/main/backend/model/model.go#L1268) in dev and in a GitHub action as part of our production deploy. 

### How do I inspect the PostgreSQL database?
```bash
cd docker;
docker compose exec postgres psql -h localhost -U postgres postgres;
```
will put you in a postgresql cli connected to your local postgres docker container.
Run commands such as `\d` to list all tables, `\d projects` to describe the schema of a
table (i.e. projects), or `show * from sessions` to look at data (i.e. rows in the sessions table).

### How to generate the graphql server definitions?
Per the [Makefile](https://github.com/highlight/highlight/blob/main/backend/Makefile), `cd backend; make private-gen` for changes to [private schema.graphqls](https://github.com/highlight/highlight/blob/main/backend/private-graph/graph/schema.graphqls) and `cd backend; make public-gen` for changes to [public schema.graphqls](https://github.com/highlight/highlight/blob/main/backend/public-graph/graph/schema.graphqls#L4). The commands can also be executed inside docker:

```bash
cd backend;
make private-gen;
make public-gen;
```
