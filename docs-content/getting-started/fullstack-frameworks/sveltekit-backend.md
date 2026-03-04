# SvelteKit – Backend instrumentation with Highlight

> These instructions complement the existing SvelteKit quick-start. Follow them **in addition to** the browser SDK setup to enable full-stack tracing and error reporting with Highlight.

---

## 1. Install the backend SDK

```bash
yarn add @highlight-run/node
# or
npm i @highlight-run/node
```

> The `@highlight-run/node` package works in any Node runtime (Vite dev-server, Cloud functions, container, etc.).  
> SvelteKit runs both locally and in production as a regular Node process, so the same steps apply everywhere.

---

## 2. Initialise Highlight once on server start-up

Create (or update) `src/hooks.server.ts` so the first code that runs on the server initialises Highlight and propagates request headers.

```ts title="src/hooks.server.ts"
import { H } from '@highlight-run/node';
import type { Handle } from '@sveltejs/kit';

// 1️⃣  Initialise the SDK.  Place your project ID here.
H.init({ projectID: '<YOUR-PROJECT-ID>' });

export const handle: Handle = async ({ event, resolve }) => {
  // 2️⃣  Wrap the request so Highlight can link client & server activity.
  return H.runWithHeaders(event.request.headers, async () => {
    // 3️⃣  Your logic continues unchanged.
    const response = await resolve(event);
    return response;
  });
};
```

That is **all that is required**.  Any `console.error`, thrown exception, or explicit call to `H.captureException` inside server code is now correlated with the user’s web session.

---

## 3. Verify the integration

1. Run the dev server (`npm run dev`).
2. Refresh the browser and trigger a server-side error, for example by throwing inside a `+page.server.ts` action.
3. In Highlight you should see:
   • A new error in the *Errors* tab.  
   • The error is linked to a session recording ("View session" button).
4. Production builds work the same – build & deploy, then repeat the test.

---

## 4. Common pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Errors appear but are **not linked** to a session | `runWithHeaders` not wrapping the request | Ensure the `handle` hook shown above is used and exported. |
| "projectID missing" warning on boot | `H.init` not executed before first request | Import & call `H.init` at **top-level** of `hooks.server.ts`. |
| Nothing is reported | ENV blocks outbound HTTPS (eg. firewalled VPC) | Allow egress to `highlight.io` or use a proxy. |

---

## 5. What is supported?

• Automatic capture of thrown errors and `console.*` calls.  
• Manual error / log capture via `H.captureException` & `H.log`.  
• Correlation between client session replay & backend traces.  
• Works in both Edge-middleware and traditional Node adapters.

---

## 6. Next steps

• Read the [SvelteKit quick-start](./sveltekit.md) for the full front-end guide.  
• Explore `@highlight-run/node` API for advanced logging & OpenTelemetry span capture.
