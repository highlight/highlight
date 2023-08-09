---
title: Filtering Sessions
headline: Filtering sessions
slug: filtering-sessions
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to filter sessions that you don't want to see in your session feed. This is useful for sessions that you know are not relevant to your application, or that are not actionable.

```hint
Filtered sessions do not count towards your billing quota.
```

## Filter sessions by user identifier
In some cases, you may want to filter sessions from a specific user. You can do this by adding the user identifier to the "Filtered Sessions" input under the "Session Replay" tab in your [project settings](https://app.highlight.io/settings). Please note that we use the `identifier` (or first argument) sent in your `H.identify` method to filter against (SDK docs [here](../../../sdk/client.md)).

## Filtering sessions without an error
If you're using Highlight mostly for error monitoring, enable the "Filter sessions without an error" in your [project settings](https://app.highlight.io/settings) to only record sessions with an error.

## Filtering sessions using custom logic
If you'd like to filter sessions based on custom logic (e.g. filtering sessions from users who have not logged in), use the [`manualStart` flag](https://www.highlight.io/docs/sdk/client#manualStart) in your `H.init` configuration. This will allow you to start and stop a session at your discretion. 

```js
H.init({
  manualStart: true,
  // ... other options
})
```

Then you can manually start a session by calling `H.start`:

```js
useEffect(() => {
  if (userIsLoggedIn) {
    H.start()
  }
}, [userIsLoggedIn])
```

## Disable all session recording
If you're interested in using Highlight for the error monitoring or logging products without session replay, use the follow setting:
```js
import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    disableSessionRecording: true,
    // ...
});
```

## Want to filter something else?
If you'd like an easier way to filter specific types of sessions, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).
