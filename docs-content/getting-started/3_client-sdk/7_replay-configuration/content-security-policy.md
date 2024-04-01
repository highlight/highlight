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

#### `connect-src`: `https://pub.highlight.io`
This policy is to allow connecting with Highlight servers to send recorded session data.

Your [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) definition may look something like this:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; connect-src https://pub.highlight.io;"
/>
```

```hint
highlight.run version 8.11 changes how we bundle the client so that we no longer require a `script-src` or `worker-src` definition. Make sure you are using the latest version of the SDK to use the above CSP policy.
```
