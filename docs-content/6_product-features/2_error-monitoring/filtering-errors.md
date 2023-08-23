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

## Filter errors emitted by browser extensions
If your users are using browser extensions, you may see errors that are not relevant to your application. You can filter these errors by checking the "Filter errors thrown by browser extensions" box in your [project settings](https://app.highlight.io/settings).

## Ignoring error groups from alerts
If you have alerts set up for your project, you can ignore specific error groups from triggering alerts. You can do this by clicking the "Ignore" button on the error group page.

## Filter errors by regex on the error body
If you'd like to filter specific errors by a regex pattern match against the error body, you can do so by adding error filters in your [project settings](https://app.highlight.io/settings/errors#filters) as well.

## Want to filter something else?
If you'd like an easier way to filter specific types of errors, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).
