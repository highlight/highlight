---
title: Logging in GCP
slug: gcp
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Google Cloud Platform (GCP)? Stream your logs to highlight to see everything in one place.

Check out the following examples of setting up logs streaming in these services:

## GCP Cloud Logging with Pub/Sub export

1. Setup the [Google Ops Agent](https://cloud.google.com/stackdriver/docs/solutions/agents/ops-agent) to send your infrastructure or compute logs to [Google Cloud Logging](https://console.cloud.google.com/logs/query).

2. Create a [Cloud Pub/Sub topic](https://console.cloud.google.com/cloudpubsub/topic/list) for exporting your Google cloud logs.
![](/images/gcp/step1.png)

3. Setup a [Log Router Sink](https://console.cloud.google.com/logs/router) in Google Cloud Logging
![](/images/gcp/step2.png)

4. Setup a Pub/Sub Subscription to export to highlight.io over HTTPS. Set the delivery to Push on endpoint URL  https://pub.highlight.io/v1/logs/raw?project=YOUR_PROJECT_ID&service=backend-service
![](/images/gcp/step3.png)

At this point, your infrastructure / service logs should show up in [highlight](https://app.highlight.io/logs)!
