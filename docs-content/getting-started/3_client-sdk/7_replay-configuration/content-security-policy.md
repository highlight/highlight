---
title: Content-Security-Policy
slug: content-security-policy
createdAt: 2022-03-01T00:39:25.000Z
updatedAt: 2022-03-01T01:08:28.000Z
---

```hint
You should keep reading this if your application runs in an environment that enforces content security policies.
```

`Content-Security-Policy` allows you to tell the browser what and how your page can interact with third-party scripts.

Here are the policies you'll need to set to use Highlight:

#### `script-src`: `https://static.highlight.io`
This policy is to allow downloading the Highlight runtime code for session recording and error monitoring.

#### `worker-src`: `blob: https://static.highlight.io`
This policy allows our script to create a web-worker which we use to serialize the recording data without affecting the performance of your application.

#### `connect-src`: `https://pub.highlight.io`
This policy is to allow connecting with Highlight servers to send recorded session data.

Your [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) definition may look something like this:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://static.highlight.io; worker-src: blob: https://static.highlight.io; connect-src https://pub.highlight.io;"
/>
```
