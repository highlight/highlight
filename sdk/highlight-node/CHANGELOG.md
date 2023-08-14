# @highlight-run/node

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

- Entirely replaces highlight graphql calls with opentelemetry.
- Removes dependency on graphql libraries.

## 3.1.0

### Minor Changes

- Adds a `Handlers.serverlessFunction` for use as a error wrapper in AWS Lambda.
- Adds a `H.stop()` method for shutting down the SDK and flushing unsent data.

## 3.1.2

### Minor Changes

- Removing `package.json` hoisting limits to repair missing dependencies.

## 3.1.8

### Minor Changes

- Add `serviceName` and `serviceVersion` as optional parameters to `NodeOptions`

## 3.1.9

### Patch Changes

- Updates opentelemetry dependencies to the next patch version.

## 3.1.10

### Patch Changes

- Ensures `console.log(...args)`-type arguments are serialized correctly.

## 3.2.0

### Minor Changes

- Add `metadata` option for `consumeError` and derivative functions.
