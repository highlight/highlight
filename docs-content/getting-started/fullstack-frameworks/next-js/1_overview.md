---
title: Next.js Overview
slug: nextjs-sdk
createdAt: 2022-04-01T20:28:06.000Z
updatedAt: 2022-10-18T22:40:13.000Z
---

The Highlight Next.js SDK adds additional features to Highlight, including:

- server-side error monitoring and linking to Highlight sessions

- automatic configuration of source map uploads

- automatic proxying for Highlight requests using Next.js rewrites

## Getting Started

The features in this SDK require the Highlight client SDK to be installed, so please follow the [Next.js](../../3_client-sdk/2_nextjs.md) frontend instructions if you have not yet done so.

For server-side linking to Highlight sessions, your call to `H.init` should include the `tracingOrigins` setting. If you're going to use `withHighlightConfig` and proxy your Highlight requests with a rewrite, you should also set `backendUrl`. See [H.init()](../../../sdk/client.md) for more details.

```hint
Using the new `/app` directory in Next.js 13? Refer to [this guide](./next-13-considerations.md) to ensure you're using a client component.
```

```typescript
H.init('<YOUR_PROJECT_ID>', {
    ...
    tracingOrigins: true,
    backendUrl: '/highlight-events',
    ...
});
```

### SDK Setup

Import the `@highlight-run/next` Package

```shell
# with npm
npm install @highlight-run/next

# with yarn
yarn add @highlight-run/next
```

### Wrapping your next.config.js

```hint
In order for Highlight to be aware of your project during build time, you need the `HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY` variable in your build environment. Refer to our [environment variables doc](./env-variables.md) to get this set up in your cloud provider of choice.
```

If you want to configure source map uploads during your production builds and enable the Next.js Highlight proxy rewrite, you can wrap your Next.js config with `withHighlightConfig`.

```javascript
import { withHighlightConfig } from '@highlight-run/next'
export default withHighlightConfig({
  // your next.config.js options here
})
```

### Next.js Backend Errors

If you want to monitor backend errors, this API wrapper will send your errors to Highlight and link them to the session where the network request was made. Define a `withHighlight` wrapper with any common options in a common function file. For example, you can create a `highlight.config.ts` file in the root of your next.js codebase.

```typescript
import { Highlight } from '@highlight-run/next'

export const withHighlight = Highlight({ projectID: 'YOUR_PROJECT_ID' })
```

You can then wrap each of your handlers in the Next.js `api/` directory with the `withHighlight` function from the previous step.

```typescript
import { withHighlight } from '../highlight.config'

const handler = async (req, res) => {
  res.status(200).json({ name: 'Jay' })
}

export default withHighlight(handler)
```
