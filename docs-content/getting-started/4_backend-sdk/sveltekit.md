---
title: SvelteKit Backend OpenTelemetry & Error Instrumentation
slug: sveltekit
---

# SvelteKit Backend OpenTelemetry Instrumentation (`@highlight-run/node`)

This guide walks you through instrumenting your **SvelteKit** server-side hooks (`src/hooks.server.ts`) and server routes (`+page.server.ts` / `+server.ts`) with Highlight.io and OpenTelemetry.

## 1. Install the Highlight Node SDK

```bash
npm install @highlight-run/node
```

## 2. Configure `src/hooks.server.ts`

```typescript
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { H } from '@highlight-run/node';

H.init({
  projectID: process.env.HIGHLIGHT_PROJECT_ID || '<YOUR_PROJECT_ID>',
  serviceName: 'sveltekit-backend',
  serviceVersion: process.env.COMMIT_SHA || '1.0.0',
  environment: process.env.NODE_ENV || 'production',
});

export const handle: Handle = async ({ event, resolve }) => {
  const highlightHeader = event.request.headers.get('x-highlight-request') || '';
  const [secureSessionId, requestId] = highlightHeader.split('/');

  try {
    return await H.runWithHeaders(event.request.headers, async () => resolve(event));
  } catch (error) {
    if (error instanceof Error) {
      H.consumeError(error, secureSessionId, requestId, { url: event.url.pathname, method: event.request.method });
    }
    throw error;
  }
};
```
