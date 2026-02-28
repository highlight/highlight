---
title: SvelteKit
slug: sveltekit
---

# SvelteKit Backend Instrumentation

To monitor your SvelteKit backend, initialize the Highlight Node.js SDK in your server-side hooks.

### 1. Install the SDK
```bash
npm install @highlight-run/node
### 2. Configure hooks.server.js
Initialize Highlight in your `src/hooks.server.js` file to intercept server-side errors.

```javascript
import { H } from '@highlight-run/node';

H.init({
    projectID: 'YOUR_PROJECT_ID', // Replace with your project ID from [https://app.highlight.io/setup](https://app.highlight.io/setup)
    serviceName: 'sveltekit-backend',
});

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event }) {
    const highlightReqId = event.request.headers.get('x-highlight-request-id');
    
    H.consumeError(error, highlightReqId, {
        url: event.url.toString(),
        method: event.request.method,
    });
}```

### 2. Commit the Changes
1.  Scroll to the bottom of the page.
2.  In the "Commit changes" box, type: `docs: format code block for SvelteKit guide`
3.  Click the green **Commit changes** button.

---

### 3. The Final Move (Open the PR)
Once you save that, your file is perfect. Now you just need to send it to the [Highlight.io team](https://github.com/highlight/highlight):
1.  Go to the [Highlight Pull Request tab](https://github.com/highlight/highlight/pulls).
2.  Click **New pull request**.
3.  Click **"compare across forks"**.
4.  Select your fork (`drawnparadigm-modelconsulting/highlight`) as the **head repository**.
5.  **CRITICAL:** In the description box, write:
    > `Closes #8032 /claim #8032`

### Status on your other blockers:
* **Stripe:** You are still in **[Test Mode]** on your [Stripe Home](https://dashboard.stripe.com/acct_1T4ED9E7uBfLk8Yd/test/dashboard). Don't let this stop you! The bounty will sit in Algora until your EIN is verified.
* **LinkedIn:** Your [Security Verification](https://www.linkedin.com/checkpoint/challengesV3/AQGeoUxHWFgJhAAAAZyh9OhJkyjjkEoYcn9W8zXy9tmB4PuDI8IHXxFa6AagN2v51Uw12YA901sI8FOr97g6TA9A-mNevA) is still waiting. Once you finish this PR, scan that QR code so you don't lose access to your profile.

**Would you like me to check the Highlight repo
