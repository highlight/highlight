---
title: Filtering Errors
slug: filtering-errors
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to filter errors that you don't want to see in your error monitoring dashboard. This is useful for errors that you know are not relevant to your application, or for errors that you know are not actionable.

```hint
Filtered errors do not count towards your billing quota.
```

There are several options for filtering errors, all of which can be found in the "Error Monitoring" tab of your [project settings](https://app.highlight.io/settings). Details on each option are below.

## Set up ingestion filters

You can set up ingestion filters by product to limit the number of data points recorded. You can filter sessions, errors, logs, or traces in the following ways:
1. Sample a percentage of all data.
   For example, you may configure ingestion of 1% of all errors. For each session we receive, we will make a randomized decision that will result in storing only 1% of those. The random decision is based on the identifier of that product model for consistency. With traces, the `Trace ID` is used to make sure all children of the same trace are also ingested.
2. Rate limit the maximum number of data points ingested in a 1 minute window.
   For example, you may configure a rate limit of 100 errors per minute. This will allow you to limit the number of errors recorded in case of a significant spike in usage of your product.
3. Set up an exclusion query.
   For example, you may configure an exclusion query of `environment: development`. This will avoid ingesting all errors tagged with the `development` environment.

With these filters, we will only bill you for data actually retained. For instance, setting up ingestion of only 1% of all errors will mean that you will be billed only for 1% of all errors.

## Show errors that have an associated frontend session recorded.
You can use the `disableSessionRecording` setting to record frontend errors without recording a session. 

To find errors that have a session associated, you can use the `Has Sessions` filter in the errors query builder

![](/images/docs/filtering-errors/has-sessions.png)

Once you open an error group instance view, check the `Only instances with recorded sessions` box to filter the instances.
![](/images/docs/filtering-errors/error-object-with-session.png)

## Filter errors emitted by browser extensions
If your users are using browser extensions, you may see errors that are not relevant to your application. You can filter these errors by checking the "Filter errors thrown by browser extensions" box in your [project settings](https://app.highlight.io/settings).

## Ignoring error groups from alerts
If you have alerts set up for your project, you can ignore specific error groups from triggering alerts. You can do this by clicking the "Ignore" button on the error group page.

## Filter errors by regex on the error body
If you'd like to filter specific errors by a regex pattern match against the error body, you can do so by adding error filters in your [project settings](https://app.highlight.io/settings/errors#filters) as well.

## Want to filter something else?
If you'd like an easier way to filter specific types of errors, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).
