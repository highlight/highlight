---
title: "Building Highlight’s new 'Connect' flow"
createdAt: 2025-01-30T12:00:00Z
readingTime: 18
authorFirstName: Julian
authorLastName: Schneider
authorTitle: Lead Designer @ Highlight
authorTwitter: 'https://twitter.com/interfacejulian'
authorLinkedIn: ' https://www.linkedin.com/in/schneider-ui'
authorPFP: 'https://ca.slack-edge.com/T01AEDTQ8DS-U0424EF3RK7-620a9ad15cd3-512'
authorGithub: ''
authorWebsite: ''
tags: Design
metaTitle: "Building Highlight’s new 'Connect' flow"
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```
<br/>

At Highlight, we’re always looking for ways to simplify the developer experience. Our onboarding flow is a critical part of that journey, and for a long time, it revolved around **product-specific tutorials**. Users had to integrate one product at a time—Session Replay, then Logs, then Traces—despite the fact that our integration guides for most languages already enabled multiple products at once. This extra step wasn’t organic and often led to users missing out on the full breadth of Highlight’s observability tools.

And we started hearing consistent feedback: many customers only got through **Session Replay** and never discovered the rest of Highlight’s observability stack. The additional onboarding steps were creating friction, and users weren’t seeing the full power of our platform right away.

## **Rethinking the Onboarding Flow**

We knew we needed a more seamless experience. Instead of guiding users through **individual product tutorials**, we decided to make the onboarding flow **language-specific**. Now, developers can **integrate their language of choice**—JavaScript, Python, Go, etc.—and automatically start receiving **logs, traces, and metrics** without extra setup steps.

This shift means all relevant observability data starts flowing in immediately.

![An illustration showing the old vs. new onboarding flow to highlight the simplification.](/images/blog/connect-flow/day4-cover.png)

## **How It Works**

The first step is navigating to app.highlight.io/connect and choosing your preferred language/framework. 

![A screenshot of the first screen for connect.](/images/blog/connect-flow/day4-old-new.png)

The way this works is that we automatically fetch the relevant setup guides from our docs site. And once you select a given guide, we also render the code blocks and text from each relevant guide as well.

![A screenshot of the second screen for connect.](/images/blog/connect-flow/day4-page2.png)

## **The Impact**

With this new onboarding flow, we aim to make integration smoother by removing extra setup steps and allowing users to get started with their preferred language. This approach is designed to provide a more seamless experience and make it easier for developers to access the full range of Highlight’s observability tools from the start.

## **What’s Next?**

We’re continuously iterating on the onboarding experience to make it even smoother. If you have feedback, we’d love to hear from you—drop by our **Discord** or shoot us a message!