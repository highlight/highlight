---
title: Filtering and Sampling Highlight Ingest
createdAt: 2023-10-18T00:00:00.000Z
readingTime: 3
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: Co-Founder & CTO
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
image: /images/launch/week-3/filtering.svg
tags: Product Updates
metaTitle: 'Day 4: Tracing & Filters'
---

Advanced Ingestion Filtering Techniques
In today's data-intensive environments, effectively managing the volume of data being ingested into monitoring and
analytics platforms is crucial. To assist in this, setting up ingestion filters can be a powerful tool to control the
amount and type of data recorded. Here's an expanded look at the mechanisms available and some deeper insights into
their implementation:

## Sampling Data Points

Sampling is a probabilistic method where only a subset of the incoming data points are stored.

### Mechanism

Every incoming session or trace has an associated identifier. This identifier can be hashed to produce a consistent
random number, which is then used to decide if the session or trace should be stored. For sessions, a product
model's identifier can be used, whereas for traces, the Trace ID ensures that all related traces (like child traces) are
also ingested to maintain data integrity.

### Use Cases

If you're looking to reduce storage costs or if your system often deals with redundant or similar data
points, sampling can be a beneficial approach. It's especially useful when you're more interested in identifying
overarching patterns rather than individual data points.

## Rate Limiting Data Points

Rate limiting helps to protect your system from being overwhelmed by sudden surges in data.

### Mechanism

A counter keeps track of the number of sessions or other data points ingested within the current minute. Once
the threshold (e.g., 100 sessions per minute) is reached, any additional data within that minute is discarded. The
counter resets at the start of the next minute.

### Use Cases

This approach is particularly effective for products that might experience sudden, unexpected spikes in
usage. For instance, if a product feature goes viral or if there's a sudden influx of users due to a marketing campaign,
rate limiting can prevent system overloads.

## Exclusion Queries

Exclusion queries allow for more fine-grained control by specifying exact conditions under which data points should not
be ingested.

### Mechanism

Before ingesting a data point, the system checks whether it matches any of the exclusion criteria. For
example, if the data point has a tag environment: development, and there's an exclusion query set up for this tag, the
data point will not be stored.

### Use Cases

Exclusion queries are ideal when you want to filter out data from specific environments (like development or
testing). They can also be used to exclude data from particular geographies, user groups, or any other identifiable
criteria.

## Billing Considerations

It's essential to understand that the ingestion filters directly impact billing. If you're only storing a fraction of
your incoming data, you'll only be charged for that fraction. This not only helps in cost savings but also ensures that
you're only paying for meaningful data.

## Final Thoughts

Setting up ingestion filters requires a balance between cost savings and ensuring that enough data is retained for
meaningful analysis. Regularly review and adjust these filters based on your evolving requirements and monitor the
impact of these filters on your data analytics and insights.





