---
title: "Day 1: OpenTelemetry on Highlight"
createdAt: 2024-01-29T12:00:00Z
readingTime: 3
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/launch-week/4/d1-splash.png'
tags: Launch Week 4, OpenTelemetry
metaTitle: "Day 1: Simplify tracing with OpenTelemetry and Highlight"
---

## Highlight, powered by OpenTelemetry

Instrumenting code for performance tracing is a grind.

Even worse, many observability solutions create vendor lock-in. All of that tracing work will send your data to exactly one kind of server, that you likely do not control.

## The Unified Solution: OpenTelemetry and Highlight

We're excited to introduce a powerful and flexible solution combining OpenTelemetry (OTel) with Highlight. OpenTelemetry provides comprehensive tracing, logging, metrics, and error monitoring capabilities for your application without vendor lock-in. It's a solution that is both opinionated and adaptable in terms of data storage - you can stream data to ClickHouse, Prometheus, or other open-source databases using their processors and exporters.

Highlight complements OpenTelemetry by significantly reducing the engineering overhead associated with storing and visualizing this data. Simply point your OpenTelemetry collector to Highlight - whether Cloud or Self-Hosted - and we take care of the rest. Using Kafka and ClickHouse, we ingest the data efficiently and provide you with a robust UI for searching and viewing your application's tracing data. At the same time, Highlight traces and logs attribute fine-grained server-side data to the frontend sessions, allowing you to watch user actions that run specific backend code.

Get started with [Highlight's Native OpenTelemetry docs](https://www.highlight.io/docs/getting-started/native-opentelemetry/overview).

## Key Benefits of Integrating OpenTelemetry with Highlight

1. **Vendor Agnostic Instrumentation**: Application instrumentation using OpenTelemetry is agnostic to the destination of your data. This freedom protects you from vendor lock-in and provides flexibility in your observability strategy.

2. **Broad Support for Libraries and Languages**: The open-source nature of the OpenTelemetry specification means it supports a wide array of libraries and languages, making it highly compatible and versatile.

3. **Auto-Instrumentation**: OpenTelemetry maintains a registry of over 700 compatible [libraries, plugins, and integrations](https://opentelemetry.io/ecosystem/registry/). If you're using it, there's likely an OTel plugin for it. And the library code itself may already be instrumented for OTEL.

4. **Simplified Data Management with Highlight**: By integrating OpenTelemetry with Highlight, we eliminate the complexities of storing and viewing tracing data. This seamless integration allows you to focus on what's important - understanding and optimizing your application's performance.
