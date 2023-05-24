---
title: Versioning Sessions & Errors
slug: versioning-sessions
createdAt: 2021-09-14T00:14:40.000Z
updatedAt: 2022-03-21T18:25:40.000Z
---

When using [highlight.io](https://highlight.io), it can be useful to know which version of your app a session or error is recorded on. [highlight.io](https://highlight.io) helps you by letting you tag which app version a session and error was recorded on.

To tag your sessions with a version, you can set the `version` field in [`H.init()`](../../../sdk/client.md#Hinit).

```typescript
import App from './App'
import { H } from 'highlight.run'

H.init('<YOUR_PROJECT_ID>', {
  version: process.env.REACT_APP_VERSION,
})

ReactDOM.render(<App />, document.getElementById('root'))
```

Once setup, this version will then be rendered on both the error and session views.
