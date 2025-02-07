---
title: 'Introducing: Highlight''s Next.js Integration'
createdAt: 2022-10-19T12:00:00.000Z
readingTime: 4
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
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F5QhKDf7tQxWmchZv2zDp&w=3840&q=75
tags: 'Engineering, Frontend'
metaTitle: 'Introducing: Highlight''s Next.js Integration'
---

We're excited to introduce Highlight's **Next.js Integration**—a powerful set of features that supercharges your Highlight experience as a Next.js user.

## Building for Next.js

Next.js is a React framework that lets you build server-side rendering and static web applications using React. It's one of the most popular React frameworks, and it's used by companies like Airbnb, Amazon, and Microsoft!

A large percentage of Highlight users have built their apps with Next, so we figured it was time we help those teams out 🙂. With this integration, our goal is to make it easier for Next.js users to make the most of Highlight to monitor their whole stack; both their frontend and backend!

## Full-stack monitoring

Highlight's Next.js Integration is a set of features that makes it easier than ever to get the most out of Highlight to monitor your entire application.

Add just a few lines of code to your Next.js app to unlock the Highlight features you love, including session replay, error monitoring, full-stack network request recording, and more!

![pic1.png](https://media.graphassets.com/tKgsru0Ty5bIvTXu89QA "pic1.png")

## Automatic source map enhancement

The Next.js Integration also automates the uploading of source maps, giving you nicer, more readable stack traces. We do this by providing a wrapper for your `next.config.js` file that makes it simple to configure your Next.js app for Highlight.

![pic2.png](https://media.graphassets.com/3BclMqmGRmj4zIDx907Q "pic2.png")

## Get past a**d blockers**

Using this same Highlight wrapper in your `next.config.js` file, we also help you capture more user sessions by avoiding ad blockers. By proxying highlight requests via \`withHighlightConfig\` ([link](https://docs.highlight.run/withhighlightconfig "https://docs.highlight.run/withhighlightconfig")), they are routed through YOUR backend instead of going straight to Highlight.

## How do I get started?

First, set up the Next.js SDK by following the instructions in the [Highlight docs](https://docs.highlight.run/nextjs-sdk "https://docs.highlight.run/nextjs-sdk") to get up and running. This is all you'll need to get full-stack errors alongside session replay for your Next.js app.

As an additional step, if your Next app is hosted on Vercel, you also can enable the Next.js Integration on Vercel (see the [Vercel Integrations page](https://vercel.com/integrations/highlight "https://vercel.com/integrations/highlight")) to automatically send sourcemaps to Highlight!
