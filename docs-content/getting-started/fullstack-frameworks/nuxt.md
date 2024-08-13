---
title: Nuxt.js Walkthrough
slug: nuxt
heading: Nuxt.js Walkthrough
createdAt: 2024-08-13T18:48:40.767Z
updatedAt: 2024-08-13T18:48:40.767Z
---

## Overview

Our Node.js SDK integrates seamlessly with Nuxt.js, providing both frontend session replays and server-side monitoring capabilities.

## Installation

```shell
npm install @highlight-run/node
```

## Server Instrumentation

Create a server plugin:

```typescript
// server/plugins/highlight.ts
import { H, type NodeOptions } from "@highlight-run/node"

export default defineNitroPlugin((nitro) => {
  const highlightConfig: NodeOptions = {
    projectID: process.env.HIGHLIGHT_PROJECT_ID,
  }

  if (!H.isInitialized()) {
    H.init(highlightConfig)
  }

  nitro.hooks.hook("error", async (error, { event }) => {
    const headers = event?.node.req.headers!
    const parsed = H.parseHeaders(headers)
    if (parsed !== undefined) {
      H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)
    }
  })
})
```
