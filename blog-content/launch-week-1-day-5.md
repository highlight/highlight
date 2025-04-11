---
title: 'Day 5: Our Partners & Supporters'
createdAt: 2023-04-21T12:00:00.000Z
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
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2Fy11erLrRriQHCiQeXo34&w=3840&q=75
tags: Product Updates
metaTitle: 'Day 5: Our Partners & Supporters'
---

Day 5 of launch week is here!

Today, we're announcing several partnerships that we've made this past year.

## RRweb

RRweb is a project that allows developers to record and replay dom interactions in the UI. From their website:

"RRweb is an open source web session replay library, which provides easy-to-use APIs to record user's interactions and replay it remotely."

When we started building Highlight, we used RRweb in only parts of our application, but as time went on, we began to rely more and more on it. Now, RRweb is the main recording library that powers the local Highlight recorder, which can be found [here](https://github.com/highlight/highlight/tree/main/sdk/highlight-run "https://github.com/highlight/highlight/tree/main/sdk/highlight-run"). Overall,we have a very good relationship with the RRweb team, and are very appreciative of their willingness to help clarify issues we're facing with the library.

Highlight is proudly a Gold Sponsor of the RRweb project, and we're very supportive of the direction the creators are taking the project in. Check it out at [https://rrweb.io](https://rrweb.io "https://rrweb.io").

## ClickHouse

ClickHouse is the database that powers our logging product (details [here](https://www.highlight.io/docs/general/product-features/logging/overview "https://www.highlight.io/docs/general/product-features/logging/overview")). In just a few months, we were able to become quite comfortable with Clickhouse, and it was especially valuable that ClickHouse now has a [public cloud](https://clickhouse.com/cloud "https://clickhouse.com/cloud").

About 3 months ago, we reached out the ClickHouse team, they kindly created a shared slack channel with our engineering team, and we've been off to the races ever since.

[Eric](https://www.linkedin.com/in/eric-l-m-thomas/ "https://www.linkedin.com/in/eric-l-m-thomas/") wrote about some of our ClickHouse learnings in a blog post [here](https://www.highlight.io/blog/how-we-built-logging-with-clickhouse "https://www.highlight.io/blog/how-we-built-logging-with-clickhouse"). It goes over our need for ClickHouse along with several struggles we had early on in case folks are interested using ClickHouse in a production setting.

## OpenTelemetry

Lastly, we wanted to spotlight OpenTelemetry (OTEL), a piece of software that we're very thankful for. Similar to how RRweb helps us record DOM interactions on the client, OTEL helps us record logs, traces, and errors on the server.

Regarding how we use it, we've decided on a few primitives for what an "error" and "log" are defined as (details [here](https://www.highlight.io/docs/general/company/open-source/contributing/adding-an-sdk "https://www.highlight.io/docs/general/company/open-source/contributing/adding-an-sdk")), and its been very useful to have a library of SDKs that we can use as an underlying spec & transfer method.
