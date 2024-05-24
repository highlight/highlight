---
title: Your Source Maps Should Be Public
createdAt: 2023-05-12T12:00:00Z
readingTime: 8
authorFirstName: Chris
authorLastName: Esplin
authorTitle: Software Engineer @ Highlight 
authorTwitter: 'https://twitter.com/chrisesplin'
authorLinkedIn: 'https://www.linkedin.com/in/epsilon/'
authorGithub: 'https://github.com/deltaepsilon'
authorWebsite: 'https://www.chrisesplin.com/'
authorPFP: '/images/blog/podcast/avatars/esplin.jpeg'
tags: Developer Tooling
metaTitle: Your Source Maps Should Be Public
---

Source maps are critical for web development in today's JavaScript environment.

In fact, all of our build tools—Rollup, Vite, WebPack, ESBuild—transpile and bundle our JavaScript and support source maps out of the box.

Debugging errors in production with transpiled code is nigh impossible. So our tooling creates source maps.

See [What are source maps? by Jecelyn Yeen](https://web.dev/source-maps/) for all of the details.

# Why private source maps?

Private source maps make it harder for an attacker to understand your front-end application.

An attacker can easily use public source maps to view the code in its original, un-transpiled state. The same source maps that make debugging easier make attacking your application easier.

Check out our unobfuscated source code on `https://www.highlight.io`! It's readable, public and easy to ingest for developer tools like Highlight. Our `vite` bundler generates these source maps with a [single flag](https://vitejs.dev/config/build-options.html#build-sourcemap).

![unobfuscated-source-code](/images/blog/make-source-maps-public/unobfuscated-source-code.webp)

## Why private source maps don't matter

Guess what!

With or without source maps, Chrome Dev Tools makes deconstructing your JavaScript application relatively easy.

For instance, You can open up the Network tab and watch each request and response.

![network-tab](/images/blog/make-source-maps-public/network-tab.webp)

The Application tab also surfaces the data your site is saving locally.

![application-tab](/images/blog/make-source-maps-public/application-tab.webp)

Who cares how the code is written if the results, in both data and network, are readily visible?

Dev Tools will even allow an attacker to reformat the code and use breakpoints to step through it!

And then there's ChatGPT...

### ChatGPT as de-compiler

ChatGPT struggles with long code snippets, so it's not yet a silver bullet for decompilation.

![chat-gpt-fail](/images/blog/make-source-maps-public/chat-gpt-fail.webp)

But ChatGPT can de-compile shorter code snippets quite effectively.

![chat-gpt-success](/images/blog/make-source-maps-public/chat-gpt-success.webp)

# Benefits of public source maps

## Debug with Dev Tools

Dev Tools will automatically recognize and apply public source maps to your code.

Debugging production issues will be much, much easier, especially if you see errors in your console. With public source maps, Dev Tools can link your errors directly to the de-compiled code. It's magical.

![dev-tools-debugger](/images/blog/make-source-maps-public/dev-tools-debugger.webp)

## Highlight automatically recognizes public source maps

Highlight does support private source maps. We even publish a [source map uploader](https://www.npmjs.com/package/@highlight-run/sourcemap-uploader) on NPM that will send your private source maps directly to our servers.

Our source map uploader works well, but depending on a team's setup, it can be tricky for users to implement and can become a constant source of bugs due to unique build pipelines and machine types.

However, if you make your source maps public, you don't have to do any of that work. And you automatically get production source maps for your own debugging in Dev Tools.

It's a win/win. 
