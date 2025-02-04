---
title: 'Day 2: Our Command bar, setup flow, and design system specs'
createdAt: 2023-04-18T12:00:00.000Z
readingTime: 6
authorFirstName: Jay
authorLastName: Khatri
authorTitle: 'Co-founder, Hype-man & CEO'
authorTwitter: 'https://twitter.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorGithub: ''
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F2wDcc2CoTckAIZVup0NT&w=3840&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FuoINZ0kXRI2foJbWRVdP&w=3840&q=75
tags: 'Engineering, Product Updates'
metaTitle: 'Day 2: Our Command bar, setup flow, and design system specs'
---

For launch week day 2, we're showcasing a handful of UX-related features that we've been working on these past few months. Namely:

- Our new Commandbar

\- A setup flow for new customers

Beyond that, we're also "open sourcing" the way that we do design at Highlight.io, i.e. how we manage and built design tokens for our design system, and how our design system works from a developer-experience perspective. More details below:

## Our new Commandbar

This is a feature that we've iterated on a few times since January, and took us a bit of time to get right. Using Highlight.io's [session replay feature](https://highlight.io/session-replay "https://highlight.io/session-replay"), we actually were able to analyze usage of our first version of the CommandBar to understand how and why customers were unsuccessful using the CommandBar, as well as where most customers went when they logged into Highlight.io for the first time.

![command-bar.png](https://media.graphassets.com/Lu5UkAezQBShKZvSnXe3 "command-bar.png")

We eventually ended up with a Commandbar that would prepopulate the \`identifier\` of a session query by default, as this was the most common path for our customers. We also support several other searches on sessions and errors.

If you'd like to use the Commandbar in highlight.io, you can type CMD+K in your dashboard to try it out.

## Our new setup flow

Our new setup flow has been something we've also iterated on a few times. When Julian sat down to build this, he wanted to create a more focused, isolated area of the app, so that the user wasn't distracted when getting setup. Beyond that, we wanted to focus on making several distinct steps of our setup flow, that way the user could feel like they were making progress as they were getting setup.

![setup-flow.png](https://media.graphassets.com/YmfZQuQeTfSNhDKjwdBu "setup-flow.png")

If you'd like to take a look at the setup flow, head to https://app.highlight.io/setup.

## Our design system

Last but not least, we've decided to share more about how our design system works and how we manage it.

### Design Tokens

First of all, [Julian](https://www.linkedin.com/in/schneider-ui/ "https://www.linkedin.com/in/schneider-ui/"), our lead designer, wrote up a [blog post](https://www.highlight.io/blog/design-tokens-at-highlight "https://www.highlight.io/blog/design-tokens-at-highlight") on how we manage our design tokens at Highlight.io. In short, this goes over how our design team passes of designs to our engineering team.

### A Typesafe Tailwind

Secondly, [Chris](https://www.linkedin.com/in/ccschmitz/ "https://www.linkedin.com/in/ccschmitz/"), wrote up an [article](https://www.highlight.io/blog/typesafe-tailwind "https://www.highlight.io/blog/typesafe-tailwind") on how we use several open source libraries to build out a type-safe way to map our code to css properties (rather than using something like tailwind).

These posts are part of our effort to "open source" our learnings and processes; we hope you enjoy them.
