---
title: Edge Runtime
slug: edge-runtime
heading: Edge Runtime
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/4xDCu5jSBxo"
  title="Next.js API Endpoints"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Installation

```shell
npm install @highlight-run/next
```

## Vercel Edge Runtime instrumentation

Edge runtime instrumentation is identical for both Page Router and App Router.

1. Create a file to export your `EdgeHighlight` wrapper function:

```typescript
// utils/edge-highlight.config.ts:
import { CONSTANTS } from '../../constants'
import { EdgeHighlight } from '@highlight-run/next/server'

export const withEdgeHighlight = EdgeHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
```

2. Wrap your edge function with `withEdgeHighlight`

**Page Router**
```typescript
// pages/api/edge-page-router-test.ts
import { NextRequest } from 'next/server'
import { withEdgeHighlight } from '../../utils/edge-highlight.config.ts'

export default withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: pages/api/edge-page-router-test', request.url)

	if (request.url.includes('error')) {
		throw new Error('Error: pages/api/edge-page-router-test (Edge Runtime)')
	} else {
		return new Response('Success: pages/api/edge-page-router-test')
	}
})

export const runtime = 'edge'
```

**App Router**
```typescript
// pages/api/edge-page-router-test.ts
import { NextRequest } from 'next/server'
import { withEdgeHighlight } from '../../utils/edge-highlight.config'

export default withEdgeHighlight(async function GET(request: NextRequest) {
	console.info('Here: pages/api/edge-page-router-test', request.url)

	if (request.url.includes('error')) {
		throw new Error('Error: pages/api/edge-page-router-test (Edge Runtime)')
	} else {
		return new Response('Success: pages/api/edge-page-router-test')
	}
})

export const runtime = 'edge'
```

## Validation

Copy/paste the above code snippet into `/app/api/edge-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

**Page Router**
```bash
curl http://localhost:3000/api/edge-page-router-test?error
```

**App Router**
```bash
curl http://localhost:3000/edge-app-router-test?error
```

## Related steps

- [Page Router client instrumentation](./2_page-router.md)
- [App Router client instrumentation](./3_app-router.md)
- [Advanced Configuration](./7_advanced-config.md)
