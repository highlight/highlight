---
title: Landing Site (highlight.io)
slug: landing-site
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Getting Started

The documentation rendered on https://highlight.io/docs is rendered from the [docs-content](https://github.com/highlight/highlight/tree/main/docs-content) directory. The code for rendering the landing page resides in [highlight.io](https://github.com/highlight/highlight/tree/main/highlight.io) directory.

To run the app locally, install dependencies and call `yarn dev` as follows:

```bash
yarn install
yarn dev:highlight.io
open http://localhost:4000
```

Changes to `docs-content` may require refreshing the browser.

## Frequently Asked Questions

### How do I test the blog locally?

Blog posts rely on Hygraph for rendering and use an environment variable. Reach our on our [discord](http://highlight.io/community) if you need to work on the blog.
