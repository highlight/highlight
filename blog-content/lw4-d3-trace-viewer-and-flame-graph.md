---
title: "Day 3: Flame Graphs and Integrated Session Views"
createdAt: 2024-01-31T12:00:00Z
readingTime: 3
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/launch-week/4/d3-splash.png'
tags: Launch Week 4, Tracing, Session Replay
metaTitle: "Day 3: Flame Graphs and Integrated Session Views"
---

## Transforming Trace Analysis with New Visualization Tools
During our last Launch Week, we unveiled our tracing product in beta, marking a significant milestone in our journey towards offering comprehensive application monitoring solutions. While we achieved the crucial capability of ingesting traces from applications, we quickly realized a critical challenge - the difficulty in efficiently sifting through these traces to extract actionable insights.

### Flame Graphs for Efficient Analysis

Highlight's new Flame Graphs allow you to swiftly see where time is being spent in a trace. This visual representation makes it easier to pinpoint performance bottlenecks and areas requiring attention in your application.

### Trace Details in Network Request Sessions
Imagine you're browsing a user's Session Replay recording.

You spot a loading state that lasts a bit too long. What could be causing the slow down?

Is it a network request? You check the Session Replay's embedded network tab and sure enough, you've got a slow API call! But why is it slow? 

Fortunately, your server code is fully instrumented with OpenTelemetry and sending session-matched data to Highlight, so you can click through a flame graph of that network requests traces, all the way down to an auto-instrumented Postgres database call. You figure out the exact SQL query that's missing an index.

And you didn't even have to leave the Session Replay recording!

## Why you should care

1. **In-Depth Post on Materialized ClickHouse Views**: For a detailed understanding of how these new features work, refer to our post: [Materialized ClickHouse Views (Tracing)](). This article offers an in-depth look at the technical aspects of using ClickHouse Materialized Views to drive Highlight Tracing.

2. **Quick Access to Relevant Traces**: Easily jump to a trace linked to any network request or error observed during a session.

3. **Advanced Filtering Options**: Filter spans by numeric attributes, such as duration.

4. **High-Level Metric Visualization**: At the top of the traces table, you can now view high-level metrics, giving you an overview of how often and for how long various parts of your code are executing.
