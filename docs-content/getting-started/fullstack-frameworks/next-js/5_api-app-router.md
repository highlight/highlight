---
title: App Router Api
slug: app-router
heading: Next.js App Router Api
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
npm install @highlight-run/next
```

## API Route Instrumentation

Node.js 

```hint
 Each App Router route must be wrapped individually.
```

######

1. Add `@highlight-run/node` to `experimental.serverComponentsExternalPackages` in your `next.config.js`. 

```javascript
// next.config.js
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['@highlight-run/node'],
	},
}

module.exports = nextConfig
```

2. Create a file to export your `AppRouterHighlight` wrapper function:

```typescript
// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from '@highlight-run/next/server'
import { CONSTANTS } from '../constants'

export const withAppRouterHighlight = AppRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

3. Wrap your `/app` functions with `withAppRouterHighlight`: 

```typescript
// app/nodejs-app-router-test/route.ts
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '../../utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
	console.info('Here: app/nodejs-app-router-test/route.ts')

	if (request.url?.includes('error')) {
		throw new Error('Error: app/nodejs-app-router-test (App Router)')
	} else {
		return new Response('Success: app/nodejs-app-router-test')
	}
})
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/app/api/nodejs-app-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/nodejs-app-router-test?error
```

## Related Steps

- [App Router client instrumentation](./3_app-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
