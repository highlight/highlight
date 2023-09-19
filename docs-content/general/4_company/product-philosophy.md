---
title: Product Philosophy
slug: product-philosophy
---

## Overview

This doc acts as a reference for our product philosophy at highlight.io, or to be more exact, how we think about what we build (not necessarily how we build it). It acts as a way for our team to prioritize work. If you'd like to learn more about our company values, check [this doc](./1_values.md).

Our mission is to support developers (like you) to ship with confidence. We do this by giving you the tools you need to **uncover, resolve, and prevent** issues in your web app.

## Cohesion

![](/images/Cohesion720.gif)

Our product philosophy at highlight.io is centered around the concept of "cohesion", or the idea that we're focused on building a tightly coupled suite of tools that helps developers ship software with confidence.

Prior to working on highlight.io, we all worked at several tech companies of varying sizes, and had first-hand experience trying to stitch together numerous tools to reproduce bugs. It wasn't uncommon that we had to do something like: log into Sentry to see a stacktrace, log into Splunk to query logs, and after investigating with even more tools, give up and log in "as the user" to try and reproduce the issue.

People may think that we're building multiple products (session replay, error monitoring, etc..) but we see it as one. To see this in action, see our [fullstack mapping guide](../../getting-started/2_frontend-backend-mapping.md).

## We build for today's developer.

If you're building software in today's ecosystem, you probably want to JUST focus on building software. We challenge ourselves to build developer tooling that’s simple, straightforward and opinionated, but configurable if you want to customize your setup. highlight.io is built for developers that want to **develop**. Leave the monitoring stuff to us 👍.

## The Vision

With highlight.io, we're changing that by building monitoring software that "wraps" your infrastructure and application, and we do ALL the work to stitch everything together. Our long-term goal is that you can trace everything from a button click to a server-side regression with little to no effort.

Now, if you were to ask, "but that's a lot to build, no?" we would reply with ["Yes, give us a hand?"](https://careers.highlight.io).
