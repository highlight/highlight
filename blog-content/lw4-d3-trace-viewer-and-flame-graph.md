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
authorPFP: 'https://firebasestorage.googleapis.com/v0/b/quiver-pixels-2020.appspot.com/o/F1EQ3eaBqkbEKEHBigolXIlmdut2%2F1408a808-60a6-4102-b636-08ab24041503.jpeg?alt=media&token=5f0ed5d8-c192-4aa3-a75b-3eb6cac9a552'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FE7U4wuSyS5mXKGfDOWsz&w=3840&q=75'
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
