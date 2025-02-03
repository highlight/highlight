import { goGetSnippet, initializeGoSdk } from './shared-snippets-monitoring'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets-tracing'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'

export const GoTracesReorganizedContent: QuickStartContent = {
	title: 'Tracing from a Go App',
	subtitle:
		'Learn how to set up highlight.io tracing for your Go application.',
	logoKey: 'go',
	products: ['Traces'],
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Wrap your code using the Go SDK.',
			content:
				'By wrapping your code with `StartTrace` and `EndTrace`, the Highlight Go SDK will record a span. You can create more child spans using the child context or add custom attributes to each span.',
			code: [
				{
					text: `import (
  "github.com/highlight/highlight/sdk/highlight-go"
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
