---
title: "Day 5: Grafana for Highlight"
createdAt: 2024-02-02T12:00:00Z
readingTime: 3
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/launch-week/4/d5-splash.png'
tags: Launch Week 4, Grafana
metaTitle: "Day 5: Grafana for Highlight"
---

## Grafana for Highlight
Highlight produces mountains of data. Every user session records `traces`, `logs`, `errors` and of course, a video-like `session replay`.
We’re building sophisticated visualization tools to make Highlight’s dashboards easier to use, but it’ll take a while to address every possible use case.

Grafana is a powerful compromise that we can use in the meantime to maximize flexibility and reporting power.

## The Dedicated Plugin
If you've used Grafana, you know how powerful it can be. Our new Grafana plugin for Highlight can pipe your Highlight data into any Grafana deployment. Grafana gives you full control to create wild data visualizations, solving for whatever questions your organization is asking.
Curious how many unique countries users visit your site from? Or are you looking to graph your p99 request latency for each REST API? The Highlight Grafana plugin let's you build these queries and more!

## Installation Flexibility
The plugin is designed for ease of use and flexibility. It can be installed on your own Grafana instance, giving you full control over your data visualization environment. Alternatively, for a more hands-off approach, the plugin is also available on a Grafana instance managed by Highlight.

## Benefits of the Grafana Plugin for Highlight

1. **Custom Dashboards**: Grafana for Highlight will help you build custom dashboards using metrics recorded by Highlight. Extract structured data from all of the products in highlight.

2. **Comprehensive Support**: The plugin offers full Grafana support for all Highlight resources, including Traces, Logs, Session Replay, and Errors.

3. **Advanced Aggregation Functions**: Grafana enables aggregation functions such as count, averages, and p90, or whatever custom analysis you can dream up. Uncover trends and patterns that would otherwise go unnoticed.

4. **Drill-Down Capabilities**: Leveraging the same filtering supported by the Highlight.io app, Grafana enables users to drill down into their data for more detailed analysis. This capability makes it easier to explore specific data segments and gain a more granular understanding of your data.

5. **Grouping by Custom Properties**: You can group data by custom properties, providing a more organized and insightful view of your metrics.

6. **Real-Time Alerts**: Finally, Grafana can generate metric-derived alerts. This means you can set up real-time notifications based on specific data patterns or thresholds, enabling you to respond quickly to important changes in your data.
