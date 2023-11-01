---
title: Page Router Api
slug: page-router
heading: Next.js Page Router Api
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
npm install @highlight-run/next
```

## API Route Instrumentation

```hint
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually.
```

######

1. Create a file to export your `PageRouterHighlight` wrapper function:

 ```javascript
// utils/page-router-highlight.config.ts:
import { CONSTANTS } from '../constants'
import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
 ```

2. Wrap your `/pages/api` functions with `withPageRouterHighlight`:

```typescript
// pages/api/nodejs-page-router-test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '../../utils/page-router-highlight.config'

export default withPageRouterHighlight(function handler(req: NextApiRequest, res: NextApiResponse) {
	console.info('Here: pages/api/nodejs-page-router-test.ts')

	if (req.url?.includes('error')) {
		throw new Error('Error: pages/api/nodejs-page-router-test.ts')
	} else {
		res.send('Success: pages/api/nodejs-page-router-test.ts')
	}
})
```

## Validation

1. Run your app in dev mode with `npm run dev`.
2. Copy/paste the above code snippet into `/pages/api/nodejs-page-router-test.ts` and hit the endpoint in your browser or with `curl` to watch it work.

```bash
curl http://localhost:3000/api/nodejs-page-router-test?error
```

## Related Steps

- [Page Router client instrumentation](./2_page-router.md)
- [Edge runtime API instrumentation](./6_edge-runtime.md)
- [Advanced Configuration](./7_advanced-config.md)