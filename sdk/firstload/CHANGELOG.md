# highlight.run

## 8.3.2

### Patch Changes

-   a07cdf584: correctly record stack trace for async promise rejections
-   4493988b0: support sending structured attributes in browser console logs

## 8.3.1

### Patch Changes

-   85ea62d0c: Add environment to backend error types.

## 8.3.0

### Minor Changes

-   84110aca1: Update default privacy mode to obfuscate all inputs by default. Allow user to override ofuscation with data-hl-record attribute. Fix regex expressions for telephone numbers and addresses.

### Patch Changes

-   c1773fa66: ensure cross origin iframe recording works even if the iframe reloads

## 8.2.3

### Patch Changes

-   f966390c1: ensure compatibility for JS SDKs in ES and CJS environments

## 8.2.2

### Patch Changes

-   b6172b0da: support bypassing sessionStorage entirely with the storageMode option and provide a globalStorage fallback

## 8.2.1

### Patch Changes

-   7c20f8c44: revert "ensure highlight.run script tag is only added once (#7005)"

## 8.2.0

### Minor Changes

-   8142463b5: ensure highlight script tag is only inserted once to optimize for browser performance by reducing unused javascript in next.js environments

## 8.1.0

### Minor Changes

-   b03039b6b: Adds support for `requestResponseSanitizer` to allow users to modify data from the request/response headers and body, as well as prevent the entire request/response from being logged.

### Patch Changes

-   7b931c336: ensure canvas recording works with auto snapshotting by default if no samplingStrategy is set
-   be3f51f45: Adding .js file extensions to support NodeNext module resolution in TypeScript

## 8.0.1

### Patch Changes

-   e7fa17ac7: make H.init({forceNew: true}) reset the user identifier of the new session

## 8.0.0

### Major Changes

-   4f4e5aa4f: Switches privacy settings from `enableStrictPrivacy` to `privacySetting`, which will have a `'default'` mode that uses common regex expressions and input names to obfuscate personally identifiable information. Strict privacy mode is unchanged, and can be used by setting `privacySetting` to `'strict'`. No obfuscation can still be used by setting `privacySetting` to `'none'`.

## 7.6.0

### Minor Changes

-   e264f6a61: ignore non-actionable / internal errors in client-side error handling

## 4.6.0

### Minor Changes

-   fix workspace:\* dependencies

## 5.0.0

### Major Changes

-   Pins highlight.run dynamic client version to the highlight.run package version.

### Upgrading from 4.x or older

-   We've migrated our lazy-loaded bundled to be served from static.highlight.io instead of static.highlight.run. As a
    result, if you use custom, change references form static.highlight.run to static.highlight.io.
-   There are no breaking API / package behavior changes with this release.

## 5.0.1

### Patch Changes

-   Ensures that a tab reload that resumes a previous old session (older than 4 hours) starts a new session rather than
    adding a set of data for the previous one.

## 5.1.0

### Minor Changes

-   Improves canvas recording efficiency.
-   Improves accuracy of recorded iframes.
-   Improves recording of scrolling with custom CSS.
-   Improves recording of Shadow DOM elements.
-   Smoothens replay mouse animation.

## 5.1.1

### Patch Changes

Ensures H.stop() stops recording and that visibility events do not restart recording.

-   Simplify CSP requirements by proxying web-vitals script.

## 5.1.2

### Patch Changes

-   Fix an issue that prevented recording from starting.

## 5.1.3

### Patch Changes

-   Separate the client web worker to make content security policy more strict.

## 5.1.4

### Patch Changes

-   Fix an issue with tab visibility switches breaking some recordings.

## 5.1.5

### Patch Changes

-   Fix typescript definitions in published `highlight.run` npm package.

## 5.1.6

### Patch Changes

-   Remove randomized URL param from Highlight client script to allow browser caching by client version.

## 5.1.7

### Patch Changes

-   Ensure `<video>` and `<audio>` elements are obfuscated correctly in strict privacy mode or
    with `highlight-mask` / `highlight-block`.
-   Fix a condition where `enableStrictPrivacy` with `highlight-mask` on a `<div>` would cause child elements to not be
    recorded.

## 5.1.8

### Patch Changes

-   Resolves an issue with recording events that have listeners calling preventDefault().

## 5.2.0

### Minor Changes

-   Adds support for cross-origin iframe recording.

## 5.2.1

### Patch Changes

-   Adds a list of non-retryable errors to prevent the client from unnecessary retries

## 5.2.2

### Patch Changes

-   Fixes issues in Shadow DOM recording that would omit sections of the DOM.

## 5.2.3

### Patch Changes

-   Fixes Highlight integration
    with [Segment V2 (aka @segment/analytics-next)](https://www.npmjs.com/package/@segment/analytics-next).
-   Changes iframe recording behavior for cross-origin iframes to ensure `src` is dropped as the `src` cannot be replayed.

## 5.3.3

### Minor Changes

-   Fixes cross-origin iframe bugs.
-   Add ability to opt out of client integrations.

### Patch Changes

-   Updates rollup dependency.
-   Defaults to inlining stylesheets.
-   Replaces fingerprint with generated client id.
-   Enables console and error recording on localhost.

## 5.4.0

### Minor Changes

-   Adds `recordCrossOriginIframe` setting to opt-in enable cross-origin iframe recording.

## 5.4.1

### Patch Changes

-   Ensure integrations are not initialized when `disabled: true`.

## 5.4.2

### Patch Changes

-   Adds an opt-out `reportConsoleErrors` boolean setting to `H.init` that allows disabling reporting console logs as errors.
-   Ensures `console.error(...)` calls are reported as part of highlight frontend sessions in all cases.

## 6.0.0

### Major Changes

-   Switches `reportConsoleErrors` to be disabled by default. With the setting disabled, `console.error(...)` calls will only be reported as error logs.
-   Adds a `disableSessionRecording` setting that allows using the javascript sdk for error/logs recording without capturing session replays.
-   Updates rrweb dependency.

## 6.0.1

### Patch Changes

-   Fixes `H.track` reporting to ensure events are recorded as part of the session timeline indicators.

## 6.0.2

### Patch Changes

-   Fixes typescript definitions for `highlight.run` which referenced an internal unpublished package.

## 6.0.3

### Patch Changes

-   Packages the web-vitals library as part of the highlight.io client bundle.

## 6.2.0

### Minor Changes

-   Supports recording inlined `<video>` elements such as webcams or `src="blob://...`.
-   Limits the size of network request bodies recorded to prevent replay-time crashes.

## 6.3.0

### Minor Changes

-   Support the option to redact specific request/response body keys while recording all others.

## 6.4.0

### Minor Changes

-   Moves bundling from rollup to vite.

## 6.4.1

### Patch Changes

-   Switch to umd default output.

## 6.4.3

### Patch Changes

-   Fixes to umd format

## 6.5.0

### Minor Changes

-   Adds an `H.start({forceNew: true})` option that allows forcing the start of a new session recording.

## 6.5.1

### Patch Changes

-   Turn off client sourcemaps as they cause issues with next.js frontends.

## 6.5.2

### Patch Changes

-   Target ES6 for library build compatibility.

## 6.5.3

### Patch Changes

-   The Highlight `window.fetch` proxy was only forwarding headers from `RequestInit`. It now forwards headers from `RequestInfo` as well.
-   Target ES6 for library build compatability.

## 7.0.0

### Breaking Changes

-   Removed the `feedbackWidget` option.

## 7.1.0

### Minor Changes

-   Improves the experience of configuring cross-origin `<iframe>` recording.

## 7.1.1

### Patch Changes

-   Extends the length of recorded sessions for a given project.

## 7.1.2

### Minor Changes

-   Avoid initializing highlight fetch monkeypatch more than once.

## 7.2.0

### Minor Changes

-   Capture unhandled promise exceptions in highlight errors.

## 7.3.0

### Minor Changes

-   Update format of data sent in for WebSocket events

## 7.3.1

### Patch Changes

-   Increase data transmission retry delays.

## 7.3.2

### Patch Changes

-   Ensure compatibility with native `window.Highlight` [class](https://developer.mozilla.org/en-US/docs/Web/API/Highlight).

## 7.3.3

### Patch Changes

-   Ensure `console.error` caught stack traces are not missing the top frame.

## 7.3.4

### Patch Changes

-   Add easier testing of local `@highlight-run/client` and `highlight.run` scripts.
-   Look for `window.HighlightIO` instead of `window.Highlight` when waiting for client script to load.

## 7.3.5

### Patch Changes

-   Remove any properties that throw a `structuredClone` error in `addProperties` before calling `postMessage`

## 7.3.6

### Patch Changes

-   Track identify metadata in the mixpanel integration as a tracked event.

## 7.3.7

Reserved for the Boeing 737

## 7.3.8

### Patch Changes

-   Fix `window.Promise` monkeypatch to work in Next.js frontends.

## 7.3.9

### Patch Changes

-   Fix recording of WebGL2 `<canvas>` elements that leverage `preserveDrawingBuffer: false`

## 7.3.10

### Patch Changes

-   Fix error capture of `new Error()` objects.

## 7.3.11

### Patch Changes

-   Improve `canvasInitialSnapshotDelay` logic for `<canvas>` recording to delay per-canvas.

## 7.3.12

### Patch Changes

-   Update naming of exports for Remix compatability.

## 7.3.13

### Patch Changes

-   Fix export names for unpkg / jsdelivr.

## 7.4.0

### Minor Changes

-   Return `{ sessionSecureID }` from `H.init` for consumption by Remix SDK
-   Persist `sessionSecureID` to `sessionStorage`

## 7.4.1

### Patch Changes

-   Ensure compatibility with older browser XHR implementations.

## 7.4.2

### Patch Changes

-   Add support for a new `storageMode` setting to avoid using `window.localStorage`.

## 7.4.3

### Patch Changes

-   Support passing `recordCrossOriginIframe: false` in a cross-origin iframe to record a session for the iframe contents.

## 7.4.4

### Patch Changes

-   Ensure stacktraces from Promises are parsed correctly.

## 7.5.0

### Minor Changes

-   Added support to specify `serviceName`.

## 7.5.1

### Patch Changes

-   Remove canvas recording logging (not only enabled if the `debug` setting is provided).

## 7.5.2

### Patch Changes

-   Auto-inline CSS on 127.0.0.1 (a common alias for localhost).

## 7.5.3

### Patch Changes

-   Ensure `H.snapshot()` does not use `setTimeout` to avoid blocking the event loop.

## 7.5.4

### Patch Changes

-   Record network request payloads with absolute timestamps.

## 7.5.5

### Patch Changes

-   Ensure `H.start()` and `H.stop()` behavior is async-race-safe to avoid inconsistent behavior when `H.stop()` or `H.start()` is called before recording is started.
