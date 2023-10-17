---
title: Next.js Environment
slug: environment
heading: Next.js Environment Setup (Optional)
createdAt: 2023-10-03T00:00:00.000Z
updatedAt: 2023-10-03T00:00:00.000Z
---

> This section is extra opinionated about Next.js constants. It's not for everyone. We like how `zod` and TypeScript work together to validate `process.env` inputs... but this is a suggestion. Do your own thing and replace our imports (`import CONSTANTS from 'src/app/constants'`) with your own!

1. Install Zod: `npm install zod`
2. Edit `.env` to add your projectID to `NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID`

```bash
# .env
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID='1jdkoe52'
```

3. Feed your environment variables into the application with a constants file. We're using `zod` for this example, because it creates a validated, typed `CONSTANTS` object that plays nicely with TypeScript.

```javascript
// src/app/constants.ts
import { z } from 'zod'

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID:
		process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
}

const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
	})
	.parse(publicEnv)

export default CONSTANTS
```

## Next Steps

- [Client Instrumentation](./3_client.md)
- [Api Instrumentation (Page Router)](./4_api-page-router.md)
- [Api Instrumentation (App Router)](./5_api-app-router.md)
- [Edge Runtime](./6_edge-runtime.md)
- [SSR Error Handlers](./7_ssr-error-handlers.md)
- [Configuration](./8_configuration.md)
