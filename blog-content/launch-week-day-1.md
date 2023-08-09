---
title: "Day 1: Error Monitoring - OTEL support, filtering options, webhooks"
createdAt: 2023-04-17T12:00:00Z
readingTime: 6
authorFirstName: Jay
authorLastName: Khatri
authorTitle: Co-founder, Hype-man & CEO 
authorTwitter: 'https://twitter.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorGithub: ''
authorWebsite: ''
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F2wDcc2CoTckAIZVup0NT&w=3840&q=75'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FETwP4qq3RVuVmsipTBaR&w=3840&q=75'
tags: Launch Week 1
metaTitle: "Day 1: Error Monitoring - OTEL support, filtering options, webhooks"
---

Welcome to the first ever Highlight.io launch week, where we launch a handful of features and efforts we've been working on these past few months. For our first launch this week, we're excited to share several new features to our error monitoring product, namely:

\- First-party OTEL Suppport

\- Support for fine-grained filtering of errors

\- Webhook support for alerts

More details about these features below:

## First-party OTEL Support

OTEL Support has been something we've been considering for a while. A few months ago, when we were tasked with supporting several server-side languages, we realized that we needed a common way to collect and send data to our systems. Among a few other possible options (including building this on our own 😅), we decided on OTEL because it supported most of our needs while allowing our customers to customize their client setup as well.

Vadim, our CTO, wrote up a blog post on our commitment to OTEL and open source [here](https://www.highlight.io/blog/open-telemetry "https://www.highlight.io/blog/open-telemetry").

## Fine-grained Error Filtering

Since launching our error monitoring product a few months ago, we've learned a lot from our customers. In fact, we've learned that we've got a long road ahead of us to perfect the alerting and error monitoring experience in highlight. Today, we're launching a few features to make it easy to filter out errors, and in-turn make error alerts much more consumable. Here's the tea:

#### Filtering errors emitted by chrome extensions

Everyone knows of a chrome extension on one of our your customers' clients that you get alerted for, but have no impact on the experience of your users. Today we're launching a way to filter these by default; all highlight.io customers can simply update a setting in their project to filter them.

More details in our filtering docs [here](https://www.highlight.io/docs/general/product-features/error-monitoring/filtering-errors).

#### Filter errors by regex expression

In the same vain, we also got feedback that there were errors being thrown on our users' clients that weren't common among everyone (unlike chrome extensions), so we decided to support even more customization. That is, you can now filter errors based on a regex expression, which gets applied on the body of the error being thrown.

Docs on this [here](https://www.highlight.io/docs/general/product-features/error-monitoring/filtering-errors)

## Webhooks on Alerts

The last big feature we've launched for error monitoring is the ability to trigger webhooks as part of your alerting workflows. What does that mean? Now, when you create an alert in highlight.io, you can send a webhook to zapier or even that esoteric web server you host in your basement. For docs on the specification that we send to each of these webhooks, read more [here](https://www.highlight.io/docs/general/product-features/general-features/webhooks "https://www.highlight.io/docs/general/product-features/general-features/webhooks").

That's all for Day 1 of Launch week. Have a question about getting set up on highlight.io or want to help contribute? We're all online at [highlight.io/discord](highlight.io/discord "highlight.io/discord")
