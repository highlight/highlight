import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const goGetSnippet: QuickStartStep = {
  title: 'Install the Highlight Go SDK.',
  content: 'Install the `highlight-go` package with `go get`.',
  code: {
    text: `go get -u github.com/highlight/highlight/sdk/highlight-go`,
    language: 'bash',
  },
}

export const initializeGoSdk: QuickStartStep = {
  title: 'Initialize the Highlight Go SDK.',
  content:
    "`H.Start` starts a goroutine for recording and sending backend errors. Setting your project id lets Highlight record errors for background tasks and processes that aren't associated with a frontend session.",
  code: {
    text: `import (
  H "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  // ...
  H.SetProjectID("<YOUR_PROJECT_ID>")
  H.Start()
  defer H.Stop()
  // ...
}`,
    language: 'go',
  },
}

export const customGoError: QuickStartStep = {
  title: 'Record custom errors. (optional)',
  content: 'If you want to explicitly send an error to Highlight, you can use the `H.RecordError` method.',
  code: {
    text: `H.RecordError(ctx, err, attribute.String("key", "value"))`,
    language: 'go',
  },
}

export const verifyGoErrors: QuickStartStep = {
  title: 'Verify your errors are being recorded.',
  content:
    "Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from your handler. This is as easy as having a route handler return an error.",
}

export const verifyCustomError: QuickStartStep = {
  title: 'Verify your errors are being recorded.',
  content: 'Make a call to `H.RecordError` to see the resulting error in Highlight.',
  code: {
    text: `func TestErrorHandler(w http.ResponseWriter, r *http.Request) {
  H.RecordError(r.Context(), errors.New("a test error is being thrown!"))
}`,
    language: 'go',
  },
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
  title: 'Set up logging.',
  content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
    '/docs/getting-started/backend-logging/go/overview',
  )}) to get started.`,
})
