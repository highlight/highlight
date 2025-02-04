---
title: "Frontend Observability"
createdAt: 2022-10-18T12:00:00Z
readingTime: 3
authorFirstName: Haroon
authorLastName: Choudery
authorTitle: Growth Manager
authorTwitter: 'https://twitter.com/haroonchoudery'
authorLinkedIn: 'https://linkedin.com/in/haroonchoudery'
authorGithub: ''
authorWebsite: ''
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FfKKhW39R0SE2hTIalLzG&w=1920&q=75'
tags: 'Frontend, Observability, Product Updates'
metaTitle: "Frontend Observability"
---

## Overview

Today, we're excited to introduce Frontend Monitoring by Highlight — a growing suite of tools that let you analyze how your web app is performing.

Starting today, Frontend Monitoring will launch with two major features: **Web Vitals** and **Performance Metrics**.

## Web Vitals

With Web Vitals in Highlight, you can track the three primary web vitals (Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift) directly in Highlight.

Highlight records web vitals for each user session, so you can understand the app performance for each session.

![Frame 43561.png](https://media.graphassets.com/yeeuOZy7T429zRcpOimP "Frame 43561.png")

Additionally, users can see a timeline of web vitals over time, aggregated across your users.

![fcp-original.png](https://media.graphassets.com/cQBvAQMKnlr3tmJw2SQP "fcp-original.png")

With custom alerting, you can set up alerts to notify you if your web vitals are above or below a certain threshold. By default, we provide an easy option to set alerts for standard thresholds, as recommended by the [official guidelines](https://web.dev/vitals/ "https://web.dev/vitals/").

![edit-view.png](https://media.graphassets.com/KLa2zUyR0iWgijV9Cx4A "edit-view.png")

## Request Metrics

One of our users' favorite features is the ability to see network requests from a particular session in Highlight. With Request Metrics, we take this functionality a step further. Starting today, users will also be able to set up custom dashboards to track the performance of network requests over time.

![dashboard.png](https://media.graphassets.com/FhsUTbmoSgaKMvmSu1Ef "dashboard.png")

Highlight users will be able to track a variety of metrics related to the performance of their app front-end. Metrics include:

-   HTTP method
-   request size
-   response size
-   HTTP request status code
-   request latency

… and can be filtered based on the following attributes:

-   initiator type
-   URL
-   GraphQL operation name

With the introduction of Frontend Monitoring by Highlight, Highlight users can now better monitor the performance of their web app, and react to any performance issues quickly. Web Vitals helps you track how quickly your app renders and measures the friction that your users experience on page load. Request Metrics gives you an idea of how quickly your front-end renders dynamic data throughout the lifecycle of your application, both for an individual session level or across users.

Check out Frontend Monitoring today! Learn more about Frontend Monitoring [in our docs](https://docs.highlight.run/frontend-observability "https://docs.highlight.run/frontend-observability").
