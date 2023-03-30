---
title: Vercel Integration
slug: apps-vercel-integration
createdAt: 2022-10-13T18:03:19.000Z
updatedAt: 2022-10-13T18:09:17.000Z
---

If you use Vercel to deploy your app, you can install the Vercel Highlight integration here: [https://vercel.com/integrations/highlight/](https://vercel.com/integrations/highlight/)

After linking your Vercel projects to your Highlight projects, Highlight will automatically set the `HIGHLIGHT_SOURCEMAP_API_KEY` environment variable. If you're using `@higlight-run/sourcemap-uploader` or `withHighlightConfig` to upload your sourcemaps, those tools will check for this API key.
