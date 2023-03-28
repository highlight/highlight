import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { customGoError, goGetSnippet, initializeGoSdk, setUpLogging, verifyGoErrors } from './shared-snippets'

export const GoGqlgenContent: QuickStartContent = {
  title: 'Go Gqlgen',
  subtitle: 'Learn how to set up highlight.io on your Go gqlgen backend.',
  logoUrl: siteUrl('/images/quickstart/gqlgen.svg'),
  entries: [
    frontendInstallSnippet,
    goGetSnippet,
    initializeGoSdk,
    {
      title: 'Add the Highlight gqlgen error handler.',
      content:
        '`H.NewGraphqlTracer` provides a middleware you can add to your [GraphQL](https://gqlgen.com/getting-started/) handler to automatically record and send GraphQL resolver errors to Highlight.',
      code: {
        text: `import (
  H "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  // ...
  server := handler.New(...)
  server.Use(H.NewGraphqlTracer("your-backend-service-name")
  // ...
}`,
        language: 'go',
      },
    },
    customGoError,
    verifyGoErrors,
    setUpLogging('gqlgen'),
  ],
}
