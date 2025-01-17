import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	verifyCustomError,
} from './shared-snippets-monitoring'

export const GoMuxReorganizedContent: QuickStartContent = {
	title: 'Go Mux',
	subtitle:
		'Learn how to set up highlight.io monitoring on your Go gorilla/mux backend.',
	logoUrl: siteUrl('/images/quickstart/mux.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight gorilla/mux error handler.',
			content:
				'`H.NewGraphqlTracer` provides a middleware you can add to your [Golang Mux](https://github.com/gorilla/mux) handler to automatically record and send GraphQL resolver errors to Highlight.',
			code: [
				{
					text: `import (
  highlightGorillaMux "github.com/highlight/highlight/sdk/highlight-go/middleware/gorillamux"
)

func main() {
  // ...
  r := mux.NewRouter()
  r.Use(highlightGorillaMux.Middleware)
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyCustomError,
		verifyLogs,
		verifyTraces,
	],
}
