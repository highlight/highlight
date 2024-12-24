import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets-monitoring'

export const GoGinReorganizedContent: QuickStartContent = {
	title: 'Go Gin',
	subtitle:
		'Learn how to set up highlight.io monitoring on your Go Gin backend.',
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight middleware.',
			content:
				'`highlightGin.Middleware()` provides is a [Go Gin](https://github.com/gin-gonic/gin) compatible middleware.',
			code: [
				{
					text: `import (
  highlightGin "github.com/highlight/highlight/sdk/highlight-go/middleware/gin"
)

func main() {
  // ...
  r := gin.Default()
  r.Use(highlightGin.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyCustomError,
		setUpLogging('gin'),
	],
}
