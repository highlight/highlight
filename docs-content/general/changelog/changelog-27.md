---
title: Changelog 27 (12/22)
slug: changelog-27
---

## Grafana support

We support integrating with Grafana to visualize metrics from your applications frontend and backend. Track network request latency, application errors, and backend traces all in one place. You'll get customization into aggregate query types (p50, p99, etc.) for performance and availability metrics automatically captured from our SDKs, with the ability to report custom metrics and traces as well.

Check our [Grafana documentation](https://www.highlight.io/docs/general/integrations/grafana-integration) for all of the details

![Grafana Dashboard](/images/changelog/27/grafana.jpg)


## Graduated pricing

Pay-as-you-go pricing now has a $50 base tier and decreases in price as volume increases.

![Graduated Pricing](/images/changelog/27/graduated-pricing.png)


## Tracing flame graph visual improvements

We're continuing to improve our Tracing Beta.

Dense flame graphs can be difficult to visualize, so we've spread them out vertically to make them more comprehensible.

![Dense Flame Graph](/images/changelog/27/dense-flame-graph.png)


## Pass environment data through our server-side SDKs

You'll get more detail about the environment in which your server-side errors are thrown. 

This is entirely automatic. Our SDKs can now export environment data from your servers directly to your Highlight reports.

