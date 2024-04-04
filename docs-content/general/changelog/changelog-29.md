---
title: Changelog 29 (4/2)
slug: changelog-29
---

## Group Matching

We're staying on top of query performance.

Instead of matching to the nearest error object (could be millions per project) we match to the closest error group (~1k per project) and then adjust the group’s embedding as a weighted average. 

This new method potentially results in better matches, because we were previously using an approximate nearest neighbor index which can potentially miss a match.

## View Logs in related resource panel

We're continuing to strengthen the connective tissue between Session Replay, Errors, Logs, and Traces.

We've now embedded our logs viewer in the Resources Panel, reducing page navigation and accelerating your investigations.

![View Logs side panel](/images/changelog/29/logs-drawer-example.png)


## Duration prefixes

Specifying everything in nanoseconds was getting obnoxious, so we've added support for hours, minutes, seconds, millisecond, and microseconds.

![duration prefixes](/images/changelog/29/duration-prefixes.png)

## Self-hosting improvements

We're seeing continued interest in self-hosted Highlight, so we're continuing to improve it.

We've simplified our `docker/run-hobby.sh` script to avoid having to run `yarn` separately.

We're also now restarting infrastructure on failure and optimizing OTel data exports.
