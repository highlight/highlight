---
title: Ignoring Sessions
headline: Ignoring and excluding sessions
slug: ignoring-sessions
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to ignore sessions that you don't want to see in your session feed. This is useful for sessions that you know are not relevant to your application, or that are not actionable.

## Ignore sessions by user identifier
In some cases, you may want to ignore sessions from a specific user. You can do this by adding the user identifier to the "Excluded Sessions" input under the "Session Replay" tab in your [project settings](https://app.highlight.io/settings). Please note that we use the `identifier` (or first argument) sent in your `H.identify` method to ignore against (SDK docs [here](../../../sdk/client.md)).

## Excluding sessions using custom logic
If you'd like to ignore sessions based on custom logic (e.g. Ignore sessions from users who have not logged in), we suggest that you use our `manualStart` flag in your `H.init` method (SDK docs [here](../../../sdk/client.md)). This will allow you to start and stop a session at your discretion. 

An example of what your `H.init` method should look like is as follows:
```js
H.init({
  manualStart: true,
  // ... other options
})
```

And a good example of manually starting a session in a `useEffect` in `react` is as follows:
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

## Want to ignore something else?
If you'd like an easier way to ignore specific types of sessions, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).
