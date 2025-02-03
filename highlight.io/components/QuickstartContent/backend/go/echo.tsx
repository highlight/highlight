import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyGoErrors,
} from './shared-snippets'

export const GoEchoContent: QuickStartContent = {
	title: 'Go Echo',
	subtitle: 'Learn how to set up highlight.io on your Go Echo backend.',
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
		setUpLogging('echo'),
	],
}
