---
title: App Router Api
slug: app-router
heading: Next.js App Router Api
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
# with npm
npm install @highlight-run/next
```

## API Route Instrumentation

Node.js 

```hint
 Each App Router route must be wrapped individually.
```

######

1. Create a file to export your `AppRouterHighlight` wrapper function:

```typescript
// src/app/_utils/app-router-highlight.config.ts:
import CONSTANTS from '../constants'
import { AppRouterHighlight } from '@highlight-run/next/server'

export const withAppRouterHighlight = AppRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

2. Wrap your `/app` functions with `withAppRouterHighlight`: 

```typescript
// app/api/app-router-test/route.ts
import { NextRequest } from 'next/server'
import { withAppRouterHighlight } from '../../_utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
	console.info('Here: /api/app-router-test/route.ts')

	if (Math.random() < 0.8) {
		return new Response('Success: /api/app-router-test')
	} else {
		throw new Error('Error: /api/app-router-test (App Router)')
	}
})
```

## Validation

Copy/paste the above code snippet into `/app/api/app-router-test.ts` and hit the endpoint with `curl` to watch it work.

```bash
curl http://localhost:3000/api/app-router-test
```

## Related Steps

- [App Router client instrumentation](./3_app-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)
