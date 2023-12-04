import { siteUrl } from '../../../../utils/urls'
import { goGetSnippet, initializeGoSdk } from '../../backend/go/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const GormTracesContent: QuickStartContent = {
	title: 'Auto-Instrumentation with GORM library',
	subtitle:
		'Learn how to set up auto-instrumented tracing for your database calls using the GORM library.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Initialize the GORM library with the Highlight hooks',
			content:
				'Import the Highlight GORM library and call the `SetupGORMTracing` hook with any attributes wanted for context.',
			code: [
				{
					text: `import (
	"github.com/highlight/highlight/sdk/highlight-go"
  htrace "github.com/highlight/highlight/sdk/highlight-go/trace"
	"go.opentelemetry.io/otel/attribute"
)

if err := htrace.SetupGORMTracing(db, attribute.String(highlight.ProjectIDAttribute, <YOUR_PROJECT_ID>)); err != nil {
  // log or handle error
}`,
					language: 'go',
				},
			],
		},
		{
			title: 'Call GORM with the trace context',
			content:
				'When making any database calls with GORM, attach a WithContext hook to provide more data about the trace.',
			code: [
				{
					text: `DB, err = gorm.Open([DB_SETTINGS])
DB.WithContext(ctx).Find(&user)
`,
					language: 'go',
				},
			],
		},
		verifyTraces,
	],
}
