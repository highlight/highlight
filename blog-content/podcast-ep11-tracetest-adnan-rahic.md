---
title: "Highlight Pod #11: Tracetest.io with Adnan Rahić"
createdAt: 2024-05-23T12:00:00Z
readingTime: 2
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: 'https://firebasestorage.googleapis.com/v0/b/quiver-pixels-2020.appspot.com/o/F1EQ3eaBqkbEKEHBigolXIlmdut2%2F1408a808-60a6-4102-b636-08ab24041503.jpeg?alt=media&token=5f0ed5d8-c192-4aa3-a75b-3eb6cac9a552'
tags: Podcast
metaTitle: "Highlight Pod Episode #11: Tracetest.io with Adnan Rahić"
---


[![Watch on YouTube](/images/blog/podcast/11/play.png)](https://dub.sh/BbjrncD)

## Tracetest.io
Tracetest is a tool that helps you test your distributed systems using the traces they generate. Before pushing code to production, Tracetest lets you run tests on the traces that your microservices, Kubernetes apps, and other components export. You write assertions that validate the traces, ensuring your system's behavior is correct across service boundaries. Tracetest integrates tightly with OpenTelemetry and can ingest traces directly or query APIs like Highlight's to fetch traces for testing.

## Virtuous Cycle: Improve both Testing and Observability
One major benefit of Tracetest's approach is driving better observability practices. By making trace-based testing part of the development lifecycle, developers are motivated to ensure good telemetry that accurately reflects system behavior. This creates a "virtuous cycle" where improving observability leads to better testing, which reinforces observability, and so on. For teams adopting OpenTelemetry or investing heavily in distributed tracing, Tracetest provides an elegant way to take advantage of that telemetry for validation and regression prevention before production.

## Connect

- [@adnanrahic](https://twitter.com/adnanrahic)
- [tracetest.io](https://tracetest.io/)
