# SvelteKit Backend Instrumentation

This guide describes how to instrument the **server-side (backend)** of a SvelteKit
application using Highlight. Backend instrumentation allows you to capture
errors, exceptions, and traces that occur during request handling on the server.

This documentation focuses exclusively on backend execution and does not cover
client-side or browser-based instrumentation.

## What is supported

Highlight supports instrumentation of the SvelteKit backend runtime, including:

- Errors thrown during request handling
- Exceptions raised in server hooks and endpoints
- Tracing and logging from server-side code execution

> Client-side (browser) instrumentation is intentionally out of scope for this guide.

## Installation

To use Highlight in a SvelteKit backend, install the Highlight Node.js SDK:

```bash
npm install @highlight-run/node
```

> This command is provided for reference only.  
> You do not need to run it in order to understand this guide.

## Setup

SvelteKit executes backend logic through server hooks, which are invoked for every
incoming request. To ensure comprehensive error and trace capture, Highlight
should be initialized inside the server hooks file.

In a typical SvelteKit project, this file is located at:

```
src/hooks.server.ts
```

Initializing Highlight in this file ensures that all server-side requests are
instrumented consistently.

### Example configuration

```ts
// src/hooks.server.ts
import { H } from '@highlight-run/node'

H.init({
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'sveltekit-backend',
})

export const handle = async ({ event, resolve }) => {
  try {
    return await resolve(event)
  } catch (error) {
    H.recordError(error)
    throw error
  }
}
```

In this example:

- `H.init` initializes Highlight for the backend service
- `projectID` identifies your Highlight project
- `serviceName` helps distinguish this service from others in the dashboard
- Errors thrown during request handling are explicitly recorded before being rethrown

## Verifying the setup

To verify that backend instrumentation is working correctly:

1. Start the SvelteKit application
2. Trigger an error in a server endpoint or server hook
3. Open the Highlight dashboard
4. Confirm that the error appears under the configured project and service

## Common pitfalls

- Do not initialize Highlight in client-side or browser-executed code
- Ensure required environment variables are available in the server runtime
- This setup applies only to backend execution and should not be reused for frontend instrumentation
