# @highlight-run/node

## 3.6.4

### Patch Changes

-   7c35f7d78: ensure header parsing is compatible with IncomingHTTPHeaders and Headers types
-   Updated dependencies [84110aca1]
-   Updated dependencies [c1773fa66]
    -   highlight.run@8.3.0

## 3.6.3

### Patch Changes

-   f966390c1: ensure compatibility for JS SDKs in ES and CJS environments
-   66b94f3f7: change serialization for node to avoid reporting objects as the message
-   Updated dependencies [f966390c1]
    -   highlight.run@8.2.3

## 3.6.2

### Patch Changes

-   e3590078e: fix @highlight-run/node crashing due to encoding not being polyfilled
-   8e91dbe55: allow arbitrarily waiting for flush to wait for logs to be sent to highlight
-   Updated dependencies [b6172b0da]
    -   highlight.run@8.2.2

## 3.6.1

### Patch Changes

-   9ad2c786c: Remove circular dependency

## 3.6.0

### Minor Changes

-   7355c73f8: Support highlight request context globally to associate async console logs / errors with highlight sessions.

### Patch Changes

-   747903c88: Repaired a bad resource merge to persist Highlight session data across all spans.
-   d452bb1b6: refactor types for highlight session context

## 3.5.3

### Patch Changes

-   Updated dependencies [7c20f8c44]
    -   highlight.run@8.2.1

## 3.5.2

### Patch Changes

-   4f535a839: ensure that console methods record structured attributes on logs
-   107f2fbd2: Npm publish cleanup. Export only dist folder.
-   4f535a839: make object stringification more robust to prevent recursion errors
-   4f535a839: bundle all dependencies into @highlight-run/node
-   4f535a839: ensure opentelemetry export does not time out
-   Updated dependencies [8142463b5]
    -   highlight.run@8.2.0

## 3.5.1

### Patch Changes

-   Updated dependencies [7b931c336]
-   Updated dependencies [b03039b6b]
-   Updated dependencies [be3f51f45]
    -   highlight.run@8.1.0

## 3.5.0

### Minor Changes

-   4607eae20: fix es module build for @highlight-run/node by switching to rollup for proper opentelemetry dependency bundling

### Patch Changes

-   Updated dependencies [e7fa17ac7]
    -   highlight.run@8.0.1

## 3.4.4

### Patch Changes

-   Updated dependencies [4f4e5aa4f]
    -   highlight.run@8.0.0

## 3.4.3

### Patch Changes

-   683330896: update opentelemetry dependencies to remove jaeger
-   Updated dependencies [e264f6a61]
    -   highlight.run@7.6.0

## 1.3.0

### Minor Changes

-   fix workspace:\* dependencies

### Patch Changes

-   Updated dependencies
    -   highlight.run@4.6.0

## 2.0.0

### Major Changes

-   require project id for H.init
-   support for errors without associated sessions/requests

## 2.4.0

### Minor Changes

-   Adds ability to record `console` methods.

## 2.4.2

### Minor Changes

-   Removes dependence on `apollo` related packages to decrease bundle size and fix types checks.

## 2.4.3

### Minor Changes

-   Exposes internal `log` function for writing logs to highlight.

## 2.5.2

### Minor Changes

-   Ensures `flush` method will send opentelemetry spans to highlight.

## 3.0.0

### Major Changes

-   Entirely replaces highlight graphql calls with opentelemetry.
-   Removes dependency on graphql libraries.

## 3.1.0

### Minor Changes

-   Adds a `Handlers.serverlessFunction` for use as a error wrapper in AWS Lambda.
-   Adds a `H.stop()` method for shutting down the SDK and flushing unsent data.

## 3.1.2

### Minor Changes

-   Removing `package.json` hoisting limits to repair missing dependencies.

## 3.1.8

### Minor Changes

-   Add `serviceName` and `serviceVersion` as optional parameters to `NodeOptions`

## 3.1.9

### Patch Changes

-   Updates opentelemetry dependencies to the next patch version.

## 3.1.10

### Patch Changes

-   Ensures `console.log(...args)`-type arguments are serialized correctly.

## 3.2.0

### Minor Changes

-   Add `metadata` option for `consumeError` and derivative functions.

## 3.3.0

### Minor Changes

-   Disables node fs instrumentation by default, can by enabled by passing `enableFsInstrumentation: true` to client option.

## 3.3.1

### Minor Changes

-   Ensure console serialization works with `BigInteger` and other unserializeable types.

## 3.3.2

### Patch Changes

-   Tune settings of opentelemetry SDK to reduce memory usage.
-   Enable GZIP compression of exported data.

## 3.4.0

### Minor Changes

-   Added `Highlight.waitForFlush` and `H.consumeAndFlush` to keep serverless functions alive while flushing

## 3.4.1

### Patch Changes

-   Excised `@protobufjs/inquire` from the build to eliminate console warnings
-   Included `@opentelemetry/*` packages in build to bundle the `ansi-color` patch and create a more deterministic build.

## 3.4.2

### Patch Changes

-   Downgrade `@opentelemetry/api` to avoid peer dependency issue. Also, it turns out that v1.4.1 is identical to v1.6.0 due to a revert.
