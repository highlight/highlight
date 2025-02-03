import { goGetSnippet, initializeGoSdk } from './shared-snippets-monitoring'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'

export const GormTracesReorganizedContent: QuickStartContent = {
	title: 'Tracing with GORM',
	subtitle:
		'Learn how to set up auto-instrumented tracing for your database calls using the GORM library.',
	logoKey: 'go',
	products: ['Traces'],
	entries: [
		frontendInstallSnippet,
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

DB, err = gorm.Open(<DB_SETTINGS>)
if err := htrace.SetupGORMTracing(DB, attribute.String(highlight.ProjectIDAttribute, <YOUR_PROJECT_ID>)); err != nil {
  highlight.RecordError(ctx, err)
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
					text: `DB.WithContext(ctx).Find(&user)
`,
					language: 'go',
				},
			],
		},
		verifyTraces,
	],
}
