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

## Set up ingestion filters

You can set up ingestion filters by product to limit the number of data points recorded. You can filter sessions, errors, logs, or traces in the following ways:
1. Sample a percentage of all data.
For example, you may configure ingestion of 1% of all sessions. For each session we receive, we will make a randomized decision that will result in storing only 1% of those. The random decision is based on the identifier of that product model for consistency. With traces, the `Trace ID` is used to make sure all children of the same trace are also ingested. 
2. Rate limit the maximum number of data points ingested in a 1 minute window.
For example, you may configure a rate limit of 100 sessions per minute. This will allow you to limit the number of sessions recorded in case of a significant spike in usage of your product.
3. Set up an exclusion query.
For example, you may configure an exclusion query of `environment: development`. This will avoid ingesting all sessions tagged with the `development` environment.

With these filters, we will only bill you for data actually retained. For instance, setting up ingestion of only 1% of all sessions will mean that you will be billed only for 1% of all sessions (as measured by [our definition of a session](events-and-users.md#definition-of-a-session)). You can configure the filters on [your project settings page in highlight](https://app.highlight.io/settings/filters).

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
