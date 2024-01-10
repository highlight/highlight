# @highlight-run/next

## 7.3.3

### Patch Changes

-   Updated dependencies [223e47fbd]
    -   @highlight-run/opentelemetry-sdk-workers@1.0.4
    -   @highlight-run/cloudflare@2.1.4

## 7.3.2

### Patch Changes

-   Updated dependencies [a07cdf584]
-   Updated dependencies [4493988b0]
    -   highlight.run@8.3.2
    -   @highlight-run/node@3.7.1

## 7.3.1

### Patch Changes

-   9eeeb5c7d: make next a peer dependency of the sdk to fix import errors
-   Updated dependencies [790c83782]
    -   @highlight-run/node@3.7.1

## 7.3.0

### Minor Changes

-   e75a480dc: Exposing Node SDK internals and using them to better instrument Next.js API wrappers
-   e75a480dc: Enable tracing

### Patch Changes

-   Updated dependencies [e75a480dc]
-   Updated dependencies [e75a480dc]
    -   @highlight-run/node@3.7.0

## 7.2.6

### Patch Changes

-   38678a9c9: Make Next a peer dependency to @highlight-run/next
-   8f0b8de6b: Repairing a circular dependency in @highlight-run/node and a bad export from @highlight-run/next's Edge runtime support
-   46ed85c91: Support environment attribute to be passed in natively.
-   Updated dependencies [85ea62d0c]
-   Updated dependencies [352641cf7]
-   Updated dependencies [8f0b8de6b]
-   Updated dependencies [46ed85c91]
    -   highlight.run@8.3.1
    -   @highlight-run/node@3.6.6

## 7.2.5

### Patch Changes

-   2fce77c13: fix opentelemetry auto instrumentation in next.js, update opentelemetry dependencies
-   Updated dependencies [bd5021a6c]
-   Updated dependencies [2fce77c13]
    -   @highlight-run/node@3.6.5

## 7.2.4

### Patch Changes

-   7c35f7d78: ensure header parsing is compatible with IncomingHTTPHeaders and Headers types
-   Updated dependencies [84110aca1]
-   Updated dependencies [c1773fa66]
-   Updated dependencies [7c35f7d78]
    -   highlight.run@8.3.0
    -   @highlight-run/node@3.6.4

## 7.2.3

### Patch Changes

-   f966390c1: ensure compatibility for JS SDKs in ES and CJS environments
-   Updated dependencies [f966390c1]
-   Updated dependencies [66b94f3f7]
    -   @highlight-run/node@3.6.3
    -   highlight.run@8.2.3

## 7.2.2

### Patch Changes

-   8e91dbe55: allow arbitrarily waiting for flush to wait for logs to be sent to highlight
-   Updated dependencies [e3590078e]
-   Updated dependencies [8e91dbe55]
-   Updated dependencies [b6172b0da]
    -   @highlight-run/node@3.6.2
    -   highlight.run@8.2.2

## 7.2.1

### Patch Changes

-   9ad2c786c: Externalize next package
-   Updated dependencies [9ad2c786c]
    -   @highlight-run/node@3.6.1

## 7.2.0

### Minor Changes

-   7355c73f8: Support highlight request context globally to associate async console logs / errors with highlight sessions.

### Patch Changes

-   d452bb1b6: refactor types for highlight session context
-   d20cbee8b: Using AsyncLocalStorage in Edge Runtime to track headers.
-   Updated dependencies [7355c73f8]
-   Updated dependencies [747903c88]
-   Updated dependencies [d452bb1b6]
    -   @highlight-run/node@3.6.0

## 7.1.1

### Patch Changes

-   Updated dependencies [7c20f8c44]
    -   highlight.run@8.2.1
    -   @highlight-run/node@3.5.3

## 7.1.0

### Minor Changes

-   107f2fbd2: Adding @highlight-run/next/ssr export.

### Patch Changes

-   107f2fbd2: Exported new pageRouterCustomErrorHandler and appRouterSsrErrorHandler
-   Updated dependencies [8142463b5]
-   Updated dependencies [4f535a839]
-   Updated dependencies [107f2fbd2]
-   Updated dependencies [4f535a839]
-   Updated dependencies [4f535a839]
-   Updated dependencies [4f535a839]
    -   highlight.run@8.2.0
    -   @highlight-run/node@3.5.2

## 7.0.2

### Patch Changes

-   ed0776f43: fix type definitions for edge wrapper for @vercel/og responses
-   Updated dependencies [7b931c336]
-   Updated dependencies [b03039b6b]
-   Updated dependencies [be3f51f45]
    -   highlight.run@8.1.0
    -   @highlight-run/node@3.5.1

## 7.0.1

### Patch Changes

-   bc2dac154: fix export from @highlight-run/next/config
-   Updated dependencies [4607eae20]
-   Updated dependencies [e7fa17ac7]
    -   @highlight-run/node@3.5.0
    -   highlight.run@8.0.1

## 7.0.0

### Patch Changes

-   Updated dependencies [4f4e5aa4f]
    -   highlight.run@8.0.0
    -   @highlight-run/node@3.4.4

## 6.0.0

### Patch Changes

-   683330896: update opentelemetry dependencies to remove jaeger
-   48e39492d: Handling undefined NEXT_RUNTIME
-   Updated dependencies [e264f6a61]
-   Updated dependencies [683330896]
    -   highlight.run@7.6.0
    -   @highlight-run/node@3.4.3

## 5.0.1

### Patch Changes

-   Updated dependencies [b55251c0c]
    -   @highlight-run/opentelemetry-sdk-workers@1.0.2
    -   @highlight-run/cloudflare@2.1.2

### 5.0.0

### Major changes

-Moved `withHighlightConfig` to `@highlight-run/next/config` to repair bundle issues

### 4.4.2

### Patch changes

-   Export types.
-   Downgrade `@opentelemetry/api` to avoid peer dependency issue. Also, it turns out that v1.4.1 is identical to v1.6.0 due to a revert.
-   Move `@opentelemetry/api` and `@opentelemetry/resources` to `devDependencies`
-   Repair `use-client` declaration
-   Bundle `@highlight-run/sourcemap-uploader`

### 4.4.1

### Patch changes

-   Excised `@protobufjs/inquire` from the build to eliminate console warnings and repair the Edge runtime wrapper
-   Exported `getHighlightErrorInitialProps` to streamline configuring `pages/_error.tsx`

### 4.4.0

### Minor changes

-   Repaired `Highlight` export from `@highlight-run/next/server` to keep serverless functions alive while flushing OTEL errors
-   Added `H` and `Highlight` exports from `@highlight-run/next/edge` to wrap Vercel's Edge Runtime API endpoints
-   Added `H` and `Highlight` exports from `@highlight-run/next/app-router` to wrap App Router API endpoints

## 4.3.2

### Patch Changes

-   Tune settings of opentelemetry SDK to reduce memory usage.
-   Enable GZIP compression of exported data.

## 4.3.1

### Minor Changes

-   Ensure console serialization works with `BigInteger` and other unserializeable types.

### 4.2.0

### Minor changes

-   Added support for setting `serviceName`

### 4.1.0

### Minor changes

-   Added support for setting metadata on `consumeError`

### 4.0.0

### Major changes

-   Removing exports for `@highlight-run/next` and `@highlight-run/next/highlight-init`. Import from `@highlight-run/next/server` and `@highlight-run/next/client` instead.
-   Adding `excludedHostnames?: string[]` to `HighlightInit` props. Pass in a list of full or partial hostnames to prevent tracking: `excludedHostnames={['localhost', 'staging']}`.

### 3.2.0

### Minor Changes

-   Adding exports for `@highlight-run/next/client` and `@highlight-run/next/server`
    > We're hoping to remove `@highlight-run/next/highlight-init` and the default `@highlight-run/next` imports in favor of the new `/client` and `/server` varieties. For now we'll maintain the original imports as aliases.
-   Adding `@highlight-run/node` and `highlight.run` to `peerDependencies`

### 3.1.2

### Patch Changes

-   Bumping to match `@highlight-run/node`

## 2.2.0

### Minor Changes

-   Adds ability to record `console` methods.

## 2.1.2

### Patch Changes

-   Adds support for Next.js `generateBuildId` config parameter, which will set Highlight `appVersion` if none is provided.

## 2.0.0

### Major Changes

-   require project id for H.init
-   support for errors without associated sessions/requests

## 1.3.0

### Minor Changes

-   fix workspace:\* dependencies

### Patch Changes

-   Updated dependencies
    -   @highlight-run/node@1.3.0
