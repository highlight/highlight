import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	verifyGoErrors,
} from './shared-snippets-monitoring'

export const GoEchoReorganizedContent: QuickStartContent = {
	title: 'Go Echo',
	subtitle:
		'Learn how to set up highlight.io monitoring on your Go Echo backend.',
	logoKey: 'go',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight Echo error handler.',
			content:
				'`highlightEcho.Middleware()` provides a [Go Echo](https://github.com/labstack/echo) middleware to automatically record and send errors to Highlight.',
			code: [
				{
					text: `import (
  highlightEcho "github.com/highlight/highlight/sdk/highlight-go/middleware/echo"
)

func main() {
  // ...
  e := echo.New()
  e.Use(highlightEcho.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyGoErrors,
		verifyLogs,
		verifyTraces,
	],
}
