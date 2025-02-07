---
title: 'Introducing: Highlight''s Node.js Integration'
createdAt: 2022-10-23T12:00:00.000Z
readingTime: 6
authorFirstName: Jay
authorLastName: Khatri
authorTitle: 'Co-founder, Hype-man & CEO'
authorTwitter: 'https://twitter.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorGithub: ''
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F2wDcc2CoTckAIZVup0NT&w=3840&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FCALcOK8TCi6D9xScSMMg&w=3840&q=75
tags: 'Backend, Engineering'
metaTitle: 'Introducing: Highlight''s Node.js Integration'
---

Today, we're excited to release Highlight's Node.js Integration! This integration makes it easy for you to make the most of Highlight for tracking information details from your JavaScript backend.

## Record backend errors

Session replay tools don't capture backend errors, until now. With our Node.js Integration, you can keep track of **all** backend errors in Highlight with just a few lines of code, all on-top of session replay.

![blog-pic-1.png](https://media.graphassets.com/GHncpi5zQeO6kaY5E7ES "blog-pic-1.png")

And beyond that, using the `consumeError` method, you can start to keep track of **custom** errors that you want to log in your app.

## Send custom metrics

With [Dashboards in Highlight](https://www.highlight.io/blog/frontend-observability "https://www.highlight.io/blog/frontend-observability"), you can set up dashboards to monitor a variety of metrics for your app. Now, with the Node.js Integration, you can easily track custom backend metrics in a dashboard.

![blog-pic-2.png](https://media.graphassets.com/OWsLWBmgSUGzPnubEeLD "blog-pic-2.png")

With the `recordMetric` method, you can keep track of important backend metrics like:

-   API response time
-   Response size
-   And more!

With [custom alerts](https://docs.highlight.run/alerts "https://docs.highlight.run/alerts"), you can set up thresholds for each backend metric, and will be notified immediately whenever a threshold is crossed in Slack or wherever your team lives.

## Not just Node.js

Using a fancier JS backend framework like Next.js or Express.js?

Don't worry! Highlight's Node.js Integration works with other backend JS frameworks that use Node.js.

## How to get started with the Node.js Integration

Getting started with the Node.js Integration is as easy as plug and play! Just follow the steps in our [getting started guide](https://docs.highlight.run/nodejs-backend "https://docs.highlight.run/nodejs-backend")! While you're on our docs site, check out our other integrations as well, (like our [Next.js Integration](https://nextjs.highlight.io/ "https://nextjs.highlight.io/")).
