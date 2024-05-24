---
title: "Day 4: Tracing SDKs for Next.js, Python, and Go/GORM"
createdAt: 2024-02-01T12:00:00Z
readingTime: 2
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
image: '/images/blog/launch-week/4/d4-splash.png'
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