---
title: Next.JS 13 Considerations
slug: nextjs-sdk
createdAt: 2022-04-01T20:28:06.000Z
updatedAt: 2022-10-18T22:40:13.000Z
---

## highlight.io with the new `app/` directory.

Given that Next.js 13 supports the new app directory and defaults to using server components, its important to make sure that highlight.io is being initialized on the client. In order to do this, we recommend creating a client component within your Next.js `/app` directory, and then importing this component in your layout file of choice.

Take a look at the example below, or for a full project, refer to this [sample github app](https://github.com/highlight/nextjs-13-sample).

```typescript
// app/highlight.tsx
'use client'

import { H } from 'highlight.run'
H.init('<YOUR_PROJECT_ID>', {
  environment: 'production',
  enableStrictPrivacy: false,
})

const Highlight = () => {
  return null
}

export default Highlight
```

In the `layout.tsx` file below, keep the imported component within the `<body></body>` component so that client-side hydration works correctly.

```typescript
// app/layout.tsx
import './globals.css'
import Highlight from './highlight'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Highlight />
        {children}
      </body>
    </html>
  )
}
```
