---
title: "Next.JS Server-side Source Maps"
createdAt: 2024-04-29T14:00:00Z
readingTime: 6
authorFirstName: Jay
authorLastName: Khatri
authorTitle: CEO
authorTwitter: 'https://twitter.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorGithub: 'https://github.com/jay-khatri'
authorWebsite: 'https://jaykhatri.com'
authorPFP: 'https://ca.slack-edge.com/T01AEDTQ8DS-U01A88AV6TU-4f7b4e7d637a-512'
tags: Launch Week 5
metaTitle: "Next.JS Server-side Source Maps"
---

# Enabling Production Sourcemaps in Next.js

While Next is a very robust framework with millions of developers that use it, there are always small kinks that can
make the developer experience particularly annoying. As a team that works
on [Highlight](https://www.highlight.io/for/next), a product that supports thousands of Next.js developers every day,
we’re often the first ones to address these pain points for the community!

Today, we’ll be covering a topic that comes up often; the ability to enable production, server-side sourcemaps in
Next.js.

## What are sourcemaps in Next.js?

Sourcemaps are files that enable you to convert transpiled or compiled code into their original source code. In
javascript specifically, this lets you “un-minify” code so that you can take a stack trace from an error and convert it
into the code that we originally wrote.

For example, below is an image of an (a) minified js file, (b) sourcemap file, and the output file when we successfully
“enhance” the minified file.

![How source map enhancement works](/images/blog/launch-week/5/next-sourcemaps.png)

In the above example, notice how the output file looks exactly like the Next.js code we would be writing in our IDE.
That’s because it is!

## Why do sourcemaps exist?

At this point, you might be thinking: “why do I even need sourcemaps?”. In other words, if we’re outputting the original
file in the first place, and I can run any JS file as-is on my own machine, why can’t we do that in production?

There’s two major reasons: Security and bandwidth.

### Sourcemaps are more secure (?)

The first reason why you might want to use sourcemaps is so that your original source code isn’t running in production
on your cloud provider’s servers (for obvious security implications). In the world of javascript, however, this is a —--
approach, because a bad actor would still have access to the business logic of your code. So while there may be a small
benefit security-wise to using sourcemaps (because it's less convenient for a bad actor), our opinion is that it's not a
big enough reason as is. Checkout more details in a youtube video by one of our engineers [here](https://www.youtube.com/watch?v=iaapWV5gGzM).

### Sourcemaps save bandwidth

The bigger reason why sourcemaps may be required is that “compressing” a given javascript codebase into a single file
actually does save quite a bit of space. Some codebases can even see upwards of a [40% size reduction](https://kinsta.com/blog/minify-javascript) when deploying to
production, which has many implications including:
Less memory footprint
Faster build times
etc..

## Client-side Sourcemaps in Next.js

So how can we enable client-side sourcemaps in Next.js? It’s pretty simple. In your next.config.js file, set the
productionBrowserSourceMaps to true, like so:

```tsx
module.exports = {
    productionBrowserSourceMaps: true,
}
```

For every error thrown in a client-side NextJS application, the output will reference the original line of code rather
than the minified version. And better yet, products like https://highlight.io will enhance them directly in
their [error monitoring products](http://highlight.io/error-monitoring).

## Server-side Sourcemaps in Next.js

Unlike client sourcemaps, Next.js doesn’t build server sourcemaps with a simple flag. Therefore, you will need to make a
[change](https://notes.dt.in.th/NextServerSideSourceMaps) to your webpack config as follows:

```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // ...

    webpack: (config, {isServer}) => {
        if (isServer) {
            config.devtool = 'source-map'
        }
        return config
    },
}
```

For the hobbyist, this can be pretty hard to configure, especially if you don’t have too much webpack knowledge, so
the https://highlight.io snippet does this automatically (code reference [here](https://github.com/highlight/highlight/blob/main//sdk/highlight-next/src/util/with-highlight-config.ts#L166)) by extending your webpack config to
automatically include this.

## Conclusion

There’s a lot to learn when it comes to configuring sourcemaps, but luckily, many products have built-in functionality
that automatically enhances errors to include proper stacktraces. If you’re ever curious about anything in the space,
please reach out in our discord: https://highlight.io/community. 
