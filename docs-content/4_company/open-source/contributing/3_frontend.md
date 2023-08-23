---
title: Frontend (app.highlight.io)
slug: frontend
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Frequently Asked Questions

### How do I change the Apollo Client GraphQL definitions?

The frontend is set up to host the Apollo Client definitions in [frontend/src/graph/operators](https://github.com/highlight/highlight/tree/main/frontend/src/graph/operators). Query definitions reside in [query.gql](https://github.com/highlight/highlight/blob/main/frontend/src/graph/operators/query.gql#L4) while mutation definitions reside in [mutation.gql](https://github.com/highlight/highlight/blob/main/frontend/src/graph/operators/mutation.gql).

Changing these two files regenerates frontend hooks and other Typescript definitions. Having the frontend running will watch these two files for changes and update generated code. See [the development docs](../../../2_getting-started/self-host/dev-deployment-guide.md) for more info on running the frontend.
