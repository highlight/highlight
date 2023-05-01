---
title: Ignoring Errors
slug: ignoring-errors
createdAt: 2022-03-22T15:27:43.000Z
updatedAt: 2022-06-27T03:34:47.000Z
---

[highlight.io](https://highlight.io) allows you to ignore errors that you don't want to see in your error monitoring dashboard. This is useful for errors that you know are not relevant to your application, or for errors that you know are not actionable.

There are several options for ignoring errors, all of which can be found in the "Error Monitoring" tab of your [project settings](https://app.highlight.io/settings). Details on each option are below.

## Ignore errors emitted by Chrome extensions
If your users are using Chrome extensions, you may see errors that are not relevant to your application. You can ignore these errors by checking the "Filter errors thrown by Chrome extensions" box in your [project settings](https://app.highlight.io/settings).

## Ignoring error groups from alerts
If you have alerts set up for your project, you can ignore specific error groups from triggering alerts. You can do this by clicking the "Ignore" button on the error group page.

## Ignore errors by regex on the error body
If you'd like to ignore specific errors by a regex pattern match against the error body, you can do so by adding error filters in your [project settings](https://app.highlight.io/settings/errors#filters) as well.

## Want to ignore something else?
If you'd like an easier way to ignore specific types of errors, we're open to feedback. Please reach out to us in our [discord community](https://highlight.io/community).
