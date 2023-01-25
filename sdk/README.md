![Docs Thumbnail v1](https://user-images.githubusercontent.com/20292680/207519838-99ef65f6-aa5d-44b7-bebd-261d127943e3.png)

## Official Highlight SDKs for JS

Welcome to the repo housing the JavaScript SDKs for [highlight.io](https://highlight.io). This repo contains all of the code that runs our supported javascript environments. For developers using our SDKs, this may be useful to dig deeper into how Highlight reports the data you see on you dashboard at https://app.highlight.io.

## What's Highlight? / Getting Started

Highlight gives you fullstack visibility by pairing frontend monitoring tooling (session replay, console contents, network requests) with more traditional server-side monitoring (error monitoring, etc..). To setup Highlight in your web app, the relevant documentation can be found at https://highlight.io/docs and on your highlight dashboard at https://app.highlight.io.

## Supported Platforms

### Client Library (`highlight.run`)

For browser-based javsacript environments; reports session replay and monitoring data.

-   NPM package: [highlight.run](https://www.npmjs.com/package/highlight.run) (`./client` + `./firstload`)
-   Setup Docs: https://www.highlight.io/docs/getting-started/client-sdk/overview
-   SDK Reference Docs: https://www.highlight.io/docs/sdk/client

### Node.js Library (`@highlight-run/node`)

For node.js environments; reports backend errrors, while matching them to frontend requests.

-   NPM Package: [@highlight-run/node](https://www.npmjs.com/package/@highlight-run/node)
-   Setup Docs: https://www.highlight.io/docs/sdk/nodejs
-   SDK Reference Docs: https://www.highlight.io/docs/sdk/nodejs

### Next.js Library (`@highlight-run/next`)

For Next.js full stack environments; reports backend errrors, while matching them to frontend requests.

-   NPM Package: [@highlight-run/next](https://www.npmjs.com/package/@highlight-run/next)
-   Setup Docs: https://www.highlight.io/docs/sdk/nextjs
-   SDK Reference Docs: https://www.highlight.io/docs/sdk/nextjs

## Contributions

Running some of this code, especially `highlight.run`, in isolation isn't going to provide a great DX. This makes code contributions difficult. We would still welcome PRs and issues on this repo. Please don't hesitate to file a ticket or [reach out](mailto:support@highlight.io) if there is anything we can do to help!
