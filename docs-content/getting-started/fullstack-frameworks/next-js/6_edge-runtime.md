---
title: Edge Runtime
slug: edge-runtime
heading: Edge Runtime
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
# with npm
npm install @highlight-run/next
```

## Vercel Edge Runtime Instrumentation

1. Create a file to export your `EdgeHighlight` wrapper function:

```typescript
// src/app/_utils/edge-highlight.config.ts:
import CONSTANTS from '../constants'
import { EdgeHighlight } from '@highlight-run/next/server'

export const withEdgeHighlight = EdgeHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

2. Wrap your edge function with `withEdgeHighlight`

```typescript
// src/app/api/edge-test/route.ts
import type {  NextRequest } from 'next/server'
import { withEdgeHighlight } from '../../_utils/edge-highlight.config'

import { NextResponse } from 'next/server'

export const GET = withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: /api/edge-test/route.ts')

	if (Math.random() < 0.8) {
		return new Response('Success: /api/edge-test')
	} else {
		throw new Error('Error: /api/edge-test (Edge Runtime)')
	}
})

export const runtime = 'edge'
```

## Validation

Copy/paste the above code snippet into `/app/api/edge-test.ts` and hit the endpoint with `curl` to watch it work.

```bash
curl http://localhost:3000/api/edge-test
```


## Next Steps

- [SSR Error Handlers](./7_ssr-error-handlers.md)
- [Configuration](./8_configuration.md)
