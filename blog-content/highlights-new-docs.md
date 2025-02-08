---
title: Introducing the new Highlight Docs
createdAt: 2022-11-22T12:00:00.000Z
readingTime: 7
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
tags: 'Engineering, Developer Experience'
metaTitle: Introducing the new Highlight Docs
---

Today, we're excited to introduce the new Highlight Docs! Over the past several weeks, we've been redesigning our docs site from the ground up, to make it more aesthetic, user-friendly, and performant than ever before.

## Building from scratch

Previously, we built out docs site using a popular documentation platform. The platform allowed us to quickly get our docs up and running, but we eventually ran into limitations.

One aspect of customizability that we desired was to maintain a consistent look and feel between our marketing site, web app, and docs site. As you'll notice, our new docs site much more neatly aligns with the overall Highlight brand.

![Instagram post - 9.png](https://media.graphassets.com/rnEBuu0ZSKK1BVl0CMub "Instagram post - 9.png")

Additionally, we wanted to control how we formatted specific portions of our documentation. For example, we wanted to include rich code examples in our docs that matched our brand exactly.

Although we didn't get this level of control with a documentation platform previously, the new Highlight docs now includes rich code examples:

![Instagram post - 2.png](https://media.graphassets.com/sjE0IYZaQHqdUT6TqB80 "Instagram post - 2.png")

## Implementation details

Not only did we want the new Highlight Docs to look better than ever, we also wanted it to perform better than ever. In order to do this, we worked on a few optimizations.

**Fast loading speeds:** For one, we used Next.js server-side rendering to make the docs site load fast. An additional benefit to rendering the docs server-side is an added SEO boost.

**Custom search:** We also implemented our own custom search functionality, using Next.js edge runtime functions and IndexedDB caching.

![Instagram post - 3.png](https://media.graphassets.com/Pq4eVjOQ2ucpGrNHK46Z "Instagram post - 3.png")

**Dynamic link previews:** One of the cool new features that Vercel released recently is [OG image generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation "https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation"). We implemented this on the new docs site to generate dynamic link previews for each page in our docs.

![Instagram post - 7.png](https://media.graphassets.com/DjeGrLnaR1CMDvPeKr7h "Instagram post - 7.png")

## Get started

Check out the new Highlight docs today at [docs.highlight.io](http://docs.highlight.io "http://docs.highlight.io")!
