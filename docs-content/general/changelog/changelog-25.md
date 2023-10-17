---
title: Changelog 25 (10/03)
slug: changelog-25
---

## GitHub Enhancement Settings

We recently released GitHub-enhanced stack traces, and now we've surfaced your enhancement settings right next to your stack traces. It's a quality-of-life enhancement that unearths your buried settings and puts them right where you need them.

![GitHub stack trace settings](/images/changelog/25/github-stacktrace-settings.jpg)

## Edge-compatible Next.js

We've got errors, logs and sessions working on Vercel's Edge runtime with both Page and App Router!

The docs are a work-in-progress, but they're all available on our [Next.js Walkthrough](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js) page.

We've got new API endpoint wrappers that work with Vercel's serverless Node.js functions. And we've got a new Edge-specific API endpoint wrapper that's compatible with Edge's stripped-down API.

![Vercel Errors](/images/changelog/25/vercel-errors.webp)

## Session Exporting is getting easier.

Canvas rendering can get huge, which was causing problems with session export.

We're now rendering each Canvas chunk to a separate mp4 file so that they can export within Lambda timeout limits.

<EmbeddedVideo 
  src="https://www.loom.com/embed/2ea8b9c3f43d451285536410aa9cf325?sid=21bc2304-f230-4f50-9c8f-266e12c5fe80"
  title="Session Export"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

