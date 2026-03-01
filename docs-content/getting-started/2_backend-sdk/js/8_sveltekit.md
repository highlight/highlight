---
title: SvelteKit
slug: sveltekit
---

# SvelteKit Backend Instrumentation

To monitor your SvelteKit backend, initialize the Highlight Node.js SDK in your server-side hooks.

### 1. Install the SDK

```bash
npm install @highlight-run/node
```
```javascript
import { H } from '@highlight-run/node';

H.init({
    projectID: '1jdq7pvg', 
    serviceName: 'sveltekit-backend',
});

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event }) {
    const highlightReqId = event.request.headers.get('x-highlight-request-id');
    
    H.consumeError(error, highlightReqId, {
        url: event.url.toString(),
        method: event.request.method,
    });
}

```
