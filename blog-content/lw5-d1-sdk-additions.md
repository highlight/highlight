---
title: "Day 1: SDK Additions"
createdAt: 2024-04-29T00:00:00Z
readingTime: 3
authorFirstName: Jay
authorLastName: Khatri
authorTitle: CEO
authorTwitter: 'https://twitter.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorGithub: 'https://github.com/jay-khatri'
authorWebsite: 'https://jaykhatri.com'
authorPFP: 'https://ca.slack-edge.com/T01AEDTQ8DS-U01A88AV6TU-4f7b4e7d637a-512'
image: '/images/blog/launch-week/5/d1-splash.png'
tags: Launch Week 5
metaTitle: "Day 1: SDK Additions"
---

## Day 1: SDK Additions!

Welcome to Launch Week 5. Checkout our [launch video](https://youtu.be/HGo6wB_fL1w) or keep reading!

Today is day one, and we're launching several new SDKs and many improvements to our existing ones! Buckle up!
First of all, we've added official support for the following languages:
- Rust
- PHP
- .NET

Read more in our docs [here](https://www.highlight.io/docs/getting-started/overview)!

![SDK Images](/images/blog/launch-week/5/d1-sdks.png)


Secondly, our next JS SDK now supports tracing of your libraries with the `instrumentation Hook`. This support traces out of the box, but also attributes logs and other downstream service calls all the way back to your front end. Lastly on the Next.js end, we also support Next.js server code source maps now, so you'll have stack-traces everywhere.

And lastly, we now support sending WebSocket messages as traces to the highlight backend. So, in the same way that you would query traces for regular performance regressions, you can now query traces for WebSocket messages and analyze them!

![SDK Images](/images/blog/launch-week/5/d1-websockets.png)

That's all for launch week day 1, there’s more in store tomorrow 😎.

