---
title: Troubleshooting
slug: troubleshooting
createdAt: 2022-01-20T23:35:49.000Z
updatedAt: 2022-01-20T23:42:57.000Z
---

## Why do some parts of the session appear blank?

• For images, videos, and other external assets, Highlight does not make a copy at record time. At replay time, we make a request for the asset. If a request fails, the most common reason is because of authorization failure, the asset no longer existing, or the host server has a restrictive CORS policy

• For iFrames, Highlight will recreate an iframe with the same `src`. The iFrame will not load if the `src`'s origin has a restrictive `X-Frame-Options` header.

• For canvas/WebGL, see [WebGL](./canvas.md) to enable recording

## Why are the correct fonts not being used?

• During a replay, Highlight will make a request for the font file on your server. In the case where the request fails, Highlight will use your fallback font. The most common reason for failing is because your have a restrictive CORS policy for `Access-Control-Origin`. To allow Highlight to access the font files, you'll need to add `app.highlight.io`.
