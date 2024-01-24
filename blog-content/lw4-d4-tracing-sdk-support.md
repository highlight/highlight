---
title: "Day 4: Tracing SDKs for Next.js, Python, and Go/GORM"
createdAt: 2024-02-02T12:00:00Z
readingTime: 2
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: 'https://firebasestorage.googleapis.com/v0/b/quiver-pixels-2020.appspot.com/o/F1EQ3eaBqkbEKEHBigolXIlmdut2%2F1408a808-60a6-4102-b636-08ab24041503.jpeg?alt=media&token=5f0ed5d8-c192-4aa3-a75b-3eb6cac9a552'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FE7U4wuSyS5mXKGfDOWsz&w=3840&q=75'
tags: Launch Week 4
metaTitle: "Day 4: Tracing SDKs for Next.js, Python, and Go/GORM"
---

## Navigating Complex Tracing Integration

We launched our Highlight Tracing Beta last Launch Week.

If you live on the bleeding edge and immediately began integrating Tracing into your stack, you discovered that tracing integrations require some expertise.

## SDKs to the rescue!

We're in the process of adding Tracing support to all of our SDKs. If you build on the following stacks, you're in luck! Our SDKs are live, tested and in production.

- **Go/GORM**: We introduced GORM auto-instrumentation to automatically capture database request traces. This feature takes the guesswork out of tracing database interactions.

- **Python**: For the Python community, we've created auto-instrumentation support for popular frameworks like Django, Flask, and FastAPI, alongside common Python libraries. We currently support the `requests` library, Celery, Redis, Boto, Boto3, and SqlAlchemy.

- **Node.js**: The Node.js SDK has been upgraded to apply session and request data across related spans.

- **Next.js**: We've integrated our new Node.js features into our Next.js endpoint wrappers to automatically instrument your Next.js endpoints. We support Next.js 14, including ISR, SSR, and API endpoints for the Node.js runtime across both App and Page Routers. 

## Why is this a big deal?

Span capture is finicky, so we're doing the heavy lifting. Simply upgrading your Python, Golang and Node.js SDKs will add significant detail to your existing Highlight traces.