import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets-monitoring'

export const GoChiReorganizedContent: QuickStartContent = {
	title: 'Go Chi',
	subtitle:
		'Learn how to set up highlight.io monitoring on your Go chi backend.',
	logoUrl: siteUrl('/images/quickstart/chi.svg'),
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
