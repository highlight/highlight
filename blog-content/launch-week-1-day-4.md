---
title: 'Day 4: Logging, powered by Clickhouse'
createdAt: 2023-04-20T12:00:00.000Z
readingTime: 7
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: Co-Founder & CTO
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2Fegl9VFZaQmCfPTruqvKP&w=3840&q=75
tags: 'Engineering, Product Updates'
metaTitle: 'Day 4: Logging, powered by Clickhouse'
---

Day 4 of launch week is here!

Today marks the culmination of a quarter of hard work and new partnerships with the open source community. We're launching our new Logging product, powered by ClickHouse.

## Logs

Starting today, Highlight gives you another cheat code to figuring out how a bug occurred in the first place. By logging into highlight and visiting app.highlight.io/logs, you can now start from a powerful log search with [structured querying](https://www.highlight.io/docs/general/product-features/logging/log-search "https://www.highlight.io/docs/general/product-features/logging/log-search") and jump to the user sessions to know exactly what caused a backend error.

![Log-search720.gif](https://media.graphassets.com/DFy5e7nTuiKjnWNEgzrq "Log-search720.gif")

## Alerts

In addition to log search, we've tightly integrated our alerts infrastructure with the logging product. In other words, it's now quite easy to get a notification in your Slack or Discord channel about an error happening in your backend. We've also redesigned our alerts configuration and specifically to create monitors for your logs. Get started with a query, set up a [meaningful notification threshold](https://www.highlight.io/docs/general/product-features/general-features/alerts "https://www.highlight.io/docs/general/product-features/general-features/alerts"), and you're off to the races.

![Log-alerts720.gif](https://media.graphassets.com/67udLUkuQgqNgoaVIRkn "Log-alerts720.gif")

## Cohesion

Out of the box, logs and backend errors are always tied to the context of a user session. We do this by [passing a unique header](https://www.highlight.io/docs/general/company/product-philosphy "https://www.highlight.io/docs/general/company/product-philosphy") all the way from your frontend to your backend resources, with no config required. Context can easily be passed to other backend microservices by our SDKs - lightweight packages using OpenTelemetry under the hood.

![Cohesion720.gif](https://media.graphassets.com/DJo4A4koTKuKHdhhflf1 "Cohesion720.gif")

## Powered by Open Source

Our new logging product is powered by ClickHouse. We've [written before](https://www.highlight.io/blog/opentelemetry "https://www.highlight.io/blog/opentelemetry") about our commitment to using open source infrastructure, which gives our community the ability to self-host highlight. Our growing Discord community has been an integral part of building this product, with entire features like the Java SDK built by community members.

Interested in learning more about how we built this?

[Read more from Eric here](https://www.highlight.io/blog/how-we-built-logging-with-clickhouse "https://www.highlight.io/blog/how-we-built-logging-with-clickhouse"), the mastermind behind the implementation.
