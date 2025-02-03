import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets'

export const GoChiContent: QuickStartContent = {
	title: 'Go Chi',
	subtitle: 'Learn how to set up highlight.io on your Go chi backend.',
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
		setUpLogging('chi'),
	],
}
