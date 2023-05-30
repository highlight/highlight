---
title: React.js Error Boundary
slug: reactjs-error-boundary
createdAt: 2021-09-14T02:03:51.000Z
updatedAt: 2022-09-08T21:45:54.000Z
---

Highlight ships [`@highlight-run/react`](https://github.com/highlight/react) which can be installed alongside `highlight.run` for additional functionality for React applications.

# Error Boundary

Highlight provides an `ErrorBoundary` to help you provide a better experience for your users when your application crashes. Using an `ErrorBoundary` gives your application an opportunity to recover from a bad state.

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary>
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

## Examples

### Showing the feedback modal when a crash happens

![react error boundary](/images/docs/client-sdk/replay-configuration/react-error-boundary.png)

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary>
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

### Showing a custom feedback modal when a crash happens

You should use this if you would like to replace the feedback modal with your own styles/branding.

```typescript
import { ErrorBoundary } from '@highlight-run/react'

const App = () => (
  <ErrorBoundary
    customDialog={
      <div>
        <h2>Whoops! Looks like a crash happened.</h2>
        <p>Don't worry, our team is tracking this down!</p>

        <form>
          <label>
            Feedback
            <input type="text" />
          </label>

          <button type="submit">Send Feedback</button>
        </form>
      </div>
    }
  >
    <YourAwesomeApplication />
  </ErrorBoundary>
)
```

## ErrorBoundary API

### `fallback`

A fallback component that gets rendered when the error boundary encounters an error.

## `showDialog`

Enables Highlight's crash report. When the `ErrorBoundary` is triggered, a form will be prompted to the user asking them for optional feedback. Defaults to true.

### `dialogOptions`

The strings used for the Highlight crash report.

`user`

Allows you to attach additional user information to the feedback report. If you've called [`H.identify()`](../../../sdk/client.md) in your application before, you won't have to set this, Highlight will infer the user's identity.

`title`

The title for the report dialog.

`subtitle`

The subtitle for the report dialog.

`subtitle2`

The secondary subtitle for the report dialog.

`labelName`

The label for the name field.

`labelEmail`

The label for the email field.

`labelComments`

The label for the verbatim field.

`labelClose`

The label for the close button.

`labelSubmit`

The label for the submit button.

`successMessage`

The label for the success message shown after the crash report is submitted.

`hideHighlightBranding`

Whether to show the Highlight branding attribution in the report dialog.

Default value is `false`.
