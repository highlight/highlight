---
title: Sourcemaps
slug: sourcemaps
createdAt: 2021-09-13T23:56:14.000Z
updatedAt: 2022-08-03T19:08:25.000Z
---

[highlight.io](https://highlight.io) has first-party support for enhancing minified stacktraces in JavaScript. We also
support options for sending sourcemaps to us in the case that your sourcemaps aren't public.

## Browser JavaScript Sourcemaps

Read more about it in
our [getting started doc](../../../getting-started/3_client-sdk/7_replay-configuration/sourcemaps.md)

## Node.js Backend Sourcemaps

Depending on your backend code implementation, your sourcemap setup may vary. The following instructions should work for
most bundlers that convert source written in Typescript to `.js` files:

### Typescript

If you build your `.ts` files into node.js `.js` bundles with `tsc`, the only configuration change required is in
the `tsconfig.json` file.

Add the following to the `compilerOptions` object:

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
```

`sourceMap` enables typescript generation of `.js.map` files, while `inlineSources` populates the `sourcesContent` key
in the `.map` files to embed the source code of your application into the map. These sourcemaps, once uploaded to
highlight, allow us to convert your minified errors back to their source line, showing a preview of the typescript code
that encountered the error.

### Uploading sourcemaps

Let's assume you run the sourcemap uploader from your repository root, your bundled backend node.js code is written
to `./backend/dist`, and the code is deployed to lambda where it runs from `/var/run/dist/`. You'll want to use
the `@highlight-run/sourcemap-uploader` package as so:

```bash
yarn @highlight-run/sourcemap-uploader upload --apiKey "${HIGHLIGHT_API_KEY}" --appVersion "${APP_VERSION}" --path ./backend/dist --basePath /var/run/dist/
```

The `HIGHLIGHT_API_KEY` environment variable will correspond to the API key for highlight, found in
the [project settings](https://app.highlight.io/settings/errors#sourcemaps). The `APP_VERSION` environment variable will
correspond to the `serviceName` and `serviceVersion`, separated by `-`. For example, if your node.js application
calls `H.init` with `service_name: 'express', serviceVersion: 'abc123'`, the `APP_VERSION` should be set
to `express-abc123`. 
