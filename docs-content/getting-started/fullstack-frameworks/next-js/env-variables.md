---
title: Sourcemaps in NextJS
slug: nextjs-sdk
createdAt: 2022-04-01T20:28:06.000Z
updatedAt: 2022-10-18T22:40:13.000Z
---

## On Vercel

If you are running your Next.js app in [Vercel](https://vercel.app/), you can install [our integration](https://vercel.com/integrations/highlight) to automatically inject the `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` environment variable. Add it to your project and configure it from the link above to inject the necessary environment variables.

## Other Cloud Providers

Start your app, go to it in the browser, then click around. Highlight will be recording your session and it will show up on [app.highlight.io/sessions](https://app.highlight/sessions) a few seconds after recording has started.

### Versioning your Sourcemaps

To version the frontend of your app, we recommend using the Next.js config [generateBuildId](https://nextjs.org/docs/api-reference/next.config.js/configuring-the-build-id). Highlight will automatically use that setting to upload sourcemaps with that version. On your next.js frontend, you'll want to set the `H.init` setting of `version` to the same value. Make sure to upgrade [@highlight-run/next to 2.1.2](https://www.npmjs.com/package/@highlight-run/next/v/2.1.2) for `generateBuildId` support.
