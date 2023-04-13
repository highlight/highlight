---
title: Vercel Integration
slug: apps-vercel-integration
createdAt: 2022-10-13T18:03:19.000Z
updatedAt: 2022-10-13T18:09:17.000Z
---

## Vercel SDK Integrations

If you use Vercel to deploy your app, you can install the Vercel Highlight integration here: [https://vercel.com/integrations/highlight/](https://vercel.com/integrations/highlight/)

After linking your Vercel projects to your Highlight projects, Highlight will automatically set the `HIGHLIGHT_SOURCEMAP_API_KEY` environment variable. If you're using `@higlight-run/sourcemap-uploader` or `withHighlightConfig` to upload your sourcemaps, those tools will check for this API key.

## Vercel Log Drain Integrations

If you use Vercel to deploy your server-side applications, the Vercel integration will also send your server-side logs to Highlight. You can view these logs in the Highlight UI by clicking on the "Logs" tab in your dashboard. To configure whether to collect logs in highlight.io, you can do this by limiting logs in your billing settings.