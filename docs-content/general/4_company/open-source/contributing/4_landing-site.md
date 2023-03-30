---
title: Landing Site (highlight.io)
slug: landing-site
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Getting Started

The documentation rendered on https://highlight.io/docs is rendered from the [docs-content](https://github.com/highlight/highlight/tree/83c412a0f3f28a13d6781593935dcee2f0e77403/docs-content) directory. The code for rendering the landing page resides in [highlight.io](https://github.com/highlight/highlight/tree/83c412a0f3f28a13d6781593935dcee2f0e77403/highlight.io) directory.

To run the app locally, install dependencies and call `yarn dev` as follows:

```bash
yarn install;
cd highlight.io;
yarn dev;
```

Changes to `docs-content` may require refreshing the browser.

## Frequently Asked Questions

### How do I test the blog locally?

Blog posts rely on Hygraph for rendering and use an environment variable. Reach our on our [discord](http://highlight.io/community) if you need to work on the blog.
