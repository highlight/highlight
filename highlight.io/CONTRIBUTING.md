---
title: Contributing to Highlight
slug: contributions
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

# How to contribute

## Application Architecture

First, you'll want to understand how Highlight is built to make changes. The best way to get a sense of this is to try and make simple dummy changes to different parts of the stack and see how the changes propagate.

- SDKs `sdk/`
  - Firstload
  - Client
  - highlight-node / other SDKs
- Public Graph `backend/public-graph/graph/schema.resolvers.go`
- Private Graph `backend/private-graph/graph/schema.resolvers.go`
- Workers `backend/worker.go`
  - Public graph worker `processPublicWorkerMessage`
  - Async worker `Start`

## Best first issues to take on

It's best to start with issues marked as ["good first issue"](https://github.com/highlight/highlight/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). We mark these issues based on how well-defined and testable they are. If you're interested in a larger project, adding support for new programming languages via a new SDK would always greatly appreciated. If there is a feature you're missing in Highlight, reach out on our [discussions](https://github.com/highlight/highlight/discussions) or on our [discord](https://highlight.io/community) to get a conversation started about the best implementation.

## How do I get started?

You'll want to spin up Highlight locally to get to developing. The best way to do this is by using docker. Check out [the self-hosting instructions](/company/open-source/self-host-hobby) for more info.

# Code Style

While we don't fret about whether you prefer tabs or spaces, we want our code to be easy to read and add to. Style preferences are codified and automated as part of CI and automated development workflows (such as `husky` and gomod configurations). If you have ideas on how to improve our style linting, open a PR and let us know!

# License

Highlight is [Apache 2](https://github.com/highlight/highlight/blob/main/LICENSE) licensed.

By contributing to Highlight, you agree that your contributions will be licensed under its Apache 2 license.
