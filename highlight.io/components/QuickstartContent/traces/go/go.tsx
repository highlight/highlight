import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const GoTracesContent: QuickStartContent = {
	title: 'Tracing from a Go App',
	subtitle:
		'Learn how to set up highlight.io tracing for your Go application.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		{
			title: 'Wrap your traced code using the Go SDK.',
			content:
				'By wrapping your code with `StartTrace` and `EndTrace`, the Highlight Go SDK will record trace duration, parent/child relationships, and service properties.',
			code: [
				{
					text: `import (
	highlight "github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
)

func functionToTrace(ctx context.Context, input int) {
	s, childContext := highlight.StartTrace(ctx, "functionToTrace", attribute.Int("custom_property", input))
	// ...
	anotherFunction(childContext)
	// ...
	highlight.EndTrace(s)
}

func anotherFunction(ctx context.Context) {
	s, _ := highlight.StartTrace(ctx, "anotherFunction")
	// ...
	highlight.EndTrace(s)
}`,
					language: 'go',
				},
			],
		},
		verifyTraces,
	],
}
