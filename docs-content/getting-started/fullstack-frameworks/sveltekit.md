---
title: SvelteKit Backend Instrumentation
slug: sveltekit
heading: SvelteKit Backend Error Monitoring & Logging with Highlight.io
---

# SvelteKit Backend Instrumentation (`@highlight-run/node`)

This guide shows how to instrument your **SvelteKit** server hooks (`src/hooks.server.ts`) to capture server-side exceptions, trace API routes, and forward structured logs to [Highlight.io](https://www.highlight.io).

## 1. Install the Node SDK

```bash
npm install @highlight-run/node
```

## 2. Initialize Highlight in `src/hooks.server.ts`

Create or update `src/hooks.server.ts` to initialize `@highlight-run/node` and wrap unhandled server errors inside SvelteKit's `handle` and `handleError` hooks:

```typescript
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { H } from '@highlight-run/node';
import { env } from '$env/dynamic/private';

H.init({
  projectID: env.HIGHLIGHT_PROJECT_ID ?? '<YOUR_PROJECT_ID>',
  serviceName: 'sveltekit-backend',
  environment: process.env.NODE_ENV ?? 'production',
});

export const handle: Handle = async ({ event, resolve }) => {
  const parts = (event.request.headers.get('x-highlight-request') ?? '').split('/');
  const sessionSecureID = event.cookies.get('sessionSecureID') ?? (parts[0] || undefined);
  const requestID = parts[1] || undefined;

  try {
    return await resolve(event);
  } catch (error) {
    if (error instanceof Error) {
      H.consumeError(error, sessionSecureID, requestID);
    }
    throw error;
  }
};

export const handleError: HandleServerError = ({ error, event }) => {
  const parts = (event.request.headers.get('x-highlight-request') ?? '').split('/');
  const sessionSecureID = parts[0] || undefined;
  const requestID = parts[1] || undefined;

  if (error instanceof Error) {
    H.consumeError(error, sessionSecureID, requestID);
  } else {
    H.consumeError(new Error(String(error)), sessionSecureID, requestID);
  }

  return {
    message: 'An unexpected server error occurred.',
  };
};
```
