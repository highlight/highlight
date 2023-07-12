---
title: Building Logging Integrations at Highlight.io
createdAt: 2023-07-11T12:00:00Z
readingTime: 4
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight 
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: Highlight Engineering
metaTitle: Building Logging Integrations at Highlight.io.
---

Engineers can build full stack web applications in a dozen different languages. For the most popular, there are hundreds of frameworks that help make the process easy and efficient, each with its own opinions on common patterns for web development. A framework typically has layers of abstraction to simplify HTTP path routing, compression, or JSON response marshalling. But as you may have guessed from the title, web frameworks often come with opinions on logging, a way for the developer to see what code actually ran during a session.

When we set out to build a logging product, we knew we would need to support all the possible configurations out there for ingesting logs. We also wanted to support a consistent efficient experience with all frameworks, supporting structured logs that would be correctly associated with frontend user sessions.

Highlight.io's logging product allows 

We considered a few solutions. The first: building our own logging protocol and ingesting logs via a series of SDKs.
TODO(vkorolik) pros/cons

Our implementation of choice came down to OpenTelemetry. 
