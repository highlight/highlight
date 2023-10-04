---
title: Next.js Api (Page Router)
slug: page-router
heading: Next.js Api (Page Router)
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

## Installation

```shell
# with npm
npm install @highlight-run/next
```

## API Route Instrumentation

```hint
This section applies to Next.js Page Router routes only. Each Page Router route must be wrapped individually.
```

######

1. Create a file to export your `PageRouterHighlight` wrapper function:

 ```javascript
// src/app/_utils/page-router-highlight.config.ts:
import CONSTANTS from '../constants'
import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
})
 ```

2. Wrap your `/pages/api` functions with `withPageRouterHighlight`:

```typescript
// pages/api/page-router-test.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '../../src/app/_utils/page-router-highlight.config'

export default withPageRouterHighlight(function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	console.info('Here: pages/api/page-router-test.ts')

	if (Math.random() < 0.8) {
		res.send('Success: pages/api/page-router-test.ts')
	} else {
		throw new Error('Error: pages/api/page-router-test.ts')
	}
})
```

## Validation

Copy/paste the above code snippet into `/pages/api/page-router-test.ts` and hit the endpoint with `curl` to watch it work.

```bash
curl http://localhost:3000/api/page-router-test
```

## Next Steps

- [Api Instrumentation (App Router)](./5_api-app-router.md)
- [Edge Runtime](./6_edge-runtime.md)
- [SSR Error Handlers](./7_ssr-error-handlers.md)
- [Configuration](./8_configuration.md)
