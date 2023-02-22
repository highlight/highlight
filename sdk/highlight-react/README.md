## @highlight-run/react

The `@highlight-run/react` package hosts the react SDK for highlight.
This includes the `<ErrorBoundary/>` component which allows capturing and rendering an
error dialog for React rendering exceptions in your app.

## Development

To test changes to the SDK and experiment with the UI, you'll want to run `yarn dev:components`.
This will run `yarn dev` in the `@highlight-run/react` SDK directory and start the 
`@highlight-run/component-preview` ladle docs from `packages/component-preview`, which [contain a story](http://localhost:61000/?story=error-boundary--content) for rendering the error boundary
(with hot reloading for changes).
