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

### Using the ErrorBoundary with react-router

If you're using react-router, you may have [error raised by your route loaders](https://reactrouter.com/en/main/route/error-element)
that can be handled with the highlight error boundary. 
To set this up, you'll need to pass your `<Route>` or your `<RouterProvider> router`
the `ErrorBoundary` prop pointing to a component that extracts the react router error from `useRouteError` and

```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	useRouteError,
} from 'react-router-dom'
import { ReportDialog } from '@highlight-run/react'
import Root from './routes/root'

function rootAction() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

function rootLoader() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

function ErrorPage() {
	const error = useRouteError() as { statusText: string; data: string }
	return (
		<ReportDialog error={new Error(`${error.statusText}: ${error.data}`)} />
	)
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route
			path="/"
			element={<Root />}
			loader={rootLoader}
			action={rootAction}
			ErrorBoundary={ErrorPage}
		>
			<Route>
				<Route index element={<Root />} />
			</Route>
		</Route>,
	),
)

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
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
