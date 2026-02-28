---
title: SvelteKit
slug: sveltekit
---

# SvelteKit Backend Instrumentation

To monitor your SvelteKit backend, initialize the Highlight Node.js SDK in your server-side hooks.

### 1. Install the SDK
```bash
npm install @highlight-run/node
2. Configure hooks.server.js
Initialize Highlight in your src/hooks.server.js file to intercept server-side errors.

JavaScript
import { H } from '@highlight-run/node';

H.init({
    projectID: 'YOUR_PROJECT_ID', 
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
