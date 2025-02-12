---
toc: Overview
title: Metrics (beta)
slug: overview
---

## OpenTelemetry Metrics with Highlight

Highlight supports accepting OpenTelemetry (OTel) metrics at our dedicated endpoint: `otel.highlight.io`. This allows you to seamlessly integrate your application's metrics data with Highlight.

To get started with sending OTel metrics to Highlight using Python, for example, you can follow the example [here](../../../getting-started/6_native-opentelemetry/6_metrics.md). We're actively working on more tutorials and examples for other languages and frameworks, so stay tuned. That being said, given that we accept the OpenTelemetry metrics protocol, you can send data from other sources, including containers, cloud providers, and more.

## Querying these metrics in the Highlight UI

Querying metrics in Highlight is similar to querying traces and logs. You can use the [Highlight Query Language](../3_general-features/search.md) to query metrics on our dashboard page, like so: 

![Basic metrics usage](/images/docs/graphing/dashboard-choices.png)

And then, you can visualize your metrics in a graph, like so:

![Basic metrics usage](/images/docs/graphing/metrics.png)

