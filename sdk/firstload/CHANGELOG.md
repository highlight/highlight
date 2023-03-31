# highlight.run

## 4.6.0

### Minor Changes

- fix workspace:\* dependencies

## 5.0.0

### Major Changes

- Pins highlight.run dynamic client version to the highlight.run package version.

### Upgrading from 4.x or older

- We've migrated our lazy-loaded bundled to be served from static.highlight.io instead of static.highlight.run. As a
  result, if you use custom, change references form static.highlight.run to static.highlight.io.
- There are no breaking API / package behavior changes with this release.

## 5.0.1

### Patch Changes

- Ensures that a tab reload that resumes a previous old session (older than 4 hours) starts a new session rather than
  adding a set of data for the previous one.

## 5.1.0

### Minor Changes

- Improves canvas recording efficiency.
- Improves accuracy of recorded iframes.
- Improves recording of scrolling with custom CSS.
- Improves recording of Shadow DOM elements.
- Smoothens replay mouse animation.

## 5.1.1

### Patch Changes

Ensures H.stop() stops recording and that visibility events do not restart recording.

- Simplify CSP requirements by proxying web-vitals script.

## 5.1.2

### Patch Changes

- Fix an issue that prevented recording from starting.

## 5.1.3

### Patch Changes

- Separate the client web worker to make content security policy more strict.

## 5.1.4

### Patch Changes

- Fix an issue with tab visibility switches breaking some recordings.

## 5.1.5

### Patch Changes

- Fix typescript definitions in published `highlight.run` npm package.

## 5.1.6

### Patch Changes

- Remove randomized URL param from Highlight client script to allow browser caching by client version.

## 5.1.7

### Patch Changes

- Ensure `<video>` and `<audio>` elements are obfuscated correctly in strict privacy mode or
  with `highlight-mask` / `highlight-block`.
- Fix a condition where `enableStrictPrivacy` with `highlight-mask` on a `<div>` would cause child elements to not be
  recorded.

## 5.1.8

### Patch Changes

- Resolves an issue with recording events that have listeners calling preventDefault().

## 5.2.0

### Minor Changes

- Adds support for cross-origin iframe recording.

## 5.2.1

### Patch Changes

- Adds a list of non-retryable errors to prevent the client from unnecessary retries

## 5.2.2

### Patch Changes

- Fixes issues in Shadow DOM recording that would omit sections of the DOM.

## 5.2.3

### Patch Changes

- Fixes Highlight integration
  with [Segment V2 (aka @segment/analytics-next)](https://www.npmjs.com/package/@segment/analytics-next).
- Changes iframe recording behavior for cross-origin iframes to ensure `src` is dropped as the `src` cannot be replayed.

## 5.3.3

### Minor Changes

- Fixes cross-origin iframe bugs.
- Add ability to opt out of client integrations.

### Patch Changes

- Updates rollup dependency.
- Defaults to inlining stylesheets.
- Replaces fingerprint with generated client id.
- Enables console and error recording on localhost.

## 5.4.0

### Minor Changes

- Adds `recordCrossOriginIframe` setting to opt-in enable cross-origin iframe recording.

## 5.4.1

### Patch Changes

- Ensure integrations are not initialized when `disabled: true`.

## 5.4.2

### Patch Changes

- Adds an opt-out `reportConsoleErrors` boolean setting to `H.init` that allows disabling reporting console logs as errors.
- Ensures `console.error(...)` calls are reported as part of highlight frontend sessions in all cases.

## 5.5.0

### Minor Changes

- Switches `reportConsoleErrors` to be disabled by default. With the setting disabled, `console.error(...)` calls will only be reported as error logs.
