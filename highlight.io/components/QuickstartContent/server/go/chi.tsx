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

export const GoChiReorganizedContent: QuickStartContent = {
	title: 'Go Chi',
	subtitle:
		'Learn how to set up highlight.io monitoring on your Go chi backend.',
	logoKey: 'chi',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight middleware.',
			content:
				'`highlightChi.Middleware` is a [Go Chi](https://github.com/go-chi/chi) compatible middleware.',
			code: [
				{
					text: `import (
  highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

func main() {
  // ...
  r := chi.NewRouter()
  r.Use(highlightChi.Middleware)
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
