---
title: "Vercel Edge Runtime Support"
createdAt: 2023-10-10T12:00:00Z
readingTime: 5
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/vercel-edge-support/vercel-edge-runtime.jpg'
tags: Next.js, Vercel, Edge
metaTitle: "Vercel Edge Runtime Support"
---

## Why Vercel Edge?
If I had to bet, I’d wager that Vercel’s [Edge Runtime](https://edge-runtime.vercel.app/) is The Next Big Thing.

That’s because Vercel cleverly built it on top of [Cloudflare Workers](https://developers.cloudflare.com/workers/), which solve the primary problems of serverless… at a price.

Think of Cloudflare Workers like the web’s [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). A single JavaScript loop in your browser can spin off seemingly infinite Web Workers. Cloudflare does the same thing, but it’s a single Node.js process spinning up seemingly infinite Cloudflare Workers.

Say goodbye to coldstarts. Network latency is lower as well, because workers are deployed across Cloudflare’s global data centers. And each process is so cheap from an infra perspective that Cloudflare can keep their pricing ridiculously low. So even with Vercel’s markup, it’s hard to argue against the cost.

## Why NOT Vercel Edge?
Vercel Edge's speed, low latency, and low cost come at a price.

Edge workers are emphatically NOT Node.js compatible. 

You might not notice it at first, but eventually you’ll try to deploy something to an Edge function and you’ll get all sorts of “X API is not supported” errors. This happens because every line of code that gets bundled into an Edge function needs to be Edge-compatible. Vercel analyzes your code in search of offending API calls. So even if that incompatible line of code is never hit at runtime, Vercel won’t let you deploy it.

If you absolutely MUST use an incompatible package, you’ll either opt for the full Node.js runtime, or you’ll find yourself patching it locally with [patch-package](https://www.npmjs.com/package/patch-package) or a command like `yarn patch` or `pnpm patch`. 

Have fun.

## How Highlight Supports Edge
We achieved Highlight’s Edge Runtime support using Richard Simpson’s ([RichiCoder1](https://github.com/RichiCoder1) on GitHub) [opentelemetry-sdk-workers](https://github.com/RichiCoder1/opentelemetry-sdk-workers) package.

We’ve forked it and made a few crucial edits to remove Edge-incompatible API calls. We’ve published our fork as `@highlight-run/opentelemetry-sdk-workers` so we can consume it for `@highlight-run/cloudflare` and `@highlight-run/next`.

[opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) has a number of Edge-incompatible API calls, but we’re resisting the urge to fork it. The codebase would be a lot to manage. Instead we’re patching those incompatible API calls using `yarn patch` in our CI/CD pipeline and bundling it with great care, such that those patched files get published to NPM as part of `@highlight-run/next`.

## Why is this necessary?
Serverless functions shut down the moment the thread frees up. If you’re not waiting for an async process or actively running a command, you can expect your Node.js or Edge worker to abort prematurely.

On the flip side, opentelemetry-js (OTEL for short) assumes a standard, always-up Node.js runtime. Because it is built for a express.js-like server-based environment, it is designed around a paradigm of background asynchronous data export. It doesn’t “await” its flushed spans. As a result, during our testing, a majority of our errors never got sent to Highlight. We were “awaiting” OTEL’s flush function, but the promise would resolve and the process would shut down while OTEL was still queuing up its call to Highlight’s servers.

Fortunately for us, TypeScript doesn’t ACTUALLY make a class’s internals private. Sure, you can label attributes as `private`, but once that code is bundled, we can `//@ts-ignore` the line and steal that internal data. Which is exactly what we do. We peer into OTEL’s internals and wait for all of its Fetch calls to complete before releasing the serverless process. The internals that we’re relying on are old, stable code that’s unlikely to change in the next year or two.

## What’s next?
`@highlight-run/next` currently relies on manual API endpoint wrapping. You’ll use functions like `AppRouterHighlight`, `PageRouterHighlight`, and `EdgeHighlight` to wrap your API endpoints.

To simplify instrumentation, an alternative approach could be to use the`next.config.js` to auto-wrap endpoints. We’d be excited to implement something of this sort if it weren’t also incredibly complicated and error-prone. A potential implementation would use Rollup and static analysis to generate new endpoints, wrap them and replace your existing code as part of Next.js’s compilation step. As you can imagine, however, this will require quite a bit of validation to make mature.

The other option is to publish a [codemod](https://github.com/facebook/jscodeshift) to edit your codebase directly. You’d commit your newly-wrapped API endpoints to your repository. No magic. Of course, you’d have to re-run the codemod after adding new endpoints. Or you could manually wrap them going forward. We’ll see how `@highlight-run/next` adoption goes and consider writing the codemod once the community is happy with it.
