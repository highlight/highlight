---
title: Nuxt Integration
slug: nuxt-integration
createdAt: 2025-06-01T23:57:09.000Z
updatedAt: 2025-06-01T23:57:09.000Z
---

# Nuxt Integration with Highlight

Easily add Session Replay, Error Monitoring, and more to your Nuxt 3 app with Highlight.

---

## 🚀 Quick Start

1. **Install SDKs:**
   ```bash
   yarn add highlight.run @highlight-run/node
   # or
   npm install highlight.run @highlight-run/node
   ```
2. **Add the client plugin:** See [Client-side Instrumentation](#2-client-side-instrumentation)
3. **Add the server plugin:** See [Server-side Instrumentation](#3-server-side-instrumentation)
4. **Configure your project:** See [Configuration](#4-configure-nuxtconfigts)
5. **Verify & Troubleshoot:** See [Verifying Installation](#6-verifying-installation) and [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

- Nuxt 3 project
- Access to your Highlight project ID ([get one here](https://app.highlight.io))

## 2. Client-side Instrumentation

Create `plugins/highlight.client.ts`:

```ts
import { H } from "highlight.run";

export default defineNuxtPlugin((nuxtApp) => {
  const { projectID, version } = useRuntimeConfig().highlight;
  nuxtApp.hook("app:beforeMount", () => {
    H.init(projectID, {
      environment: process.env.NODE_ENV,
      version,
      networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
      },
      tracingOrigins: true,
      consoleMethodsToRecord: ["error", "warn"],
    });
  });
});
```

## 3. Server-side Instrumentation

Create `server/plugins/highlight.ts`:

```ts
import { H, type NodeOptions } from "@highlight-run/node"

export default defineNitroPlugin((nitro) => {
  const { projectID } = useRuntimeConfig().highlight;
  const highlightConfig: NodeOptions = { projectID };

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

## 4. Configure `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    highlight: {
      projectID: 'YOUR_PROJECT_ID',
      version: '1.0.0',
    }
  }
})
```

## 5. Uploading Sourcemaps (Recommended)

To get readable stack traces in Highlight, upload your sourcemaps after each build. See the [Highlight sourcemap documentation](https://www.highlight.io/docs/getting-started/sourcemap-configuration) for details.

## 6. Verifying Installation

- Open your Nuxt app in the browser and check the [Highlight sessions dashboard](https://app.highlight.io/sessions) for new sessions.
- Trigger a client or server error and confirm it appears in the [Highlight errors dashboard](https://app.highlight.io/errors).
- Use your browser devtools to check for Highlight network requests.

## 7. Manual Error Reporting (Optional)

If you want to capture errors that are not automatically caught by Nitro, you can manually report them:

```ts
import { H } from "@highlight-run/node";

try {
  // your code
} catch (error) {
  H.consumeError(error);
}
```

## 8. Troubleshooting

- **Session IDs undefined:** Ensure the client SDK is initialized and all relevant headers are forwarded to the server (especially if using a reverse proxy or custom server).
- **Sourcemaps not working:** Confirm sourcemaps are uploaded and not stripped from your build output.
- **Not all errors captured:** Only errors caught by the Nitro error hook are sent automatically. Use manual error reporting for custom error handling.
- **Nuxt plugin not running:** Double-check file placement (`plugins/highlight.client.ts` for client, `server/plugins/highlight.ts` for server) and that plugins are auto-registered.
- **Environment variables:** Use Nuxt's [runtimeConfig](https://nuxt.com/docs/api/configuration/nuxt-config#runtimeconfig) for secrets and project IDs.

## 9. References

- [Highlight Docs](https://highlight.io/docs)
- [Nuxt Plugins](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Highlight Sourcemap Configuration](https://www.highlight.io/docs/getting-started/sourcemap-configuration)
- [Example Issue #6136](https://github.com/highlight/highlight/issues/6136) 
