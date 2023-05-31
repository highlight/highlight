import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const FluentForwardContent: QuickStartContent = {
	title: 'Shipping logs with Fluent Forward',
	subtitle:
		'Set up highlight.io log ingestion via Fluent Forward (fluentd / fluentbit protocol).',
	entries: [
		{
			title: 'Setup fluentd / fluent bit ingest.',
			content:
				'Route your [fluentd / fluent bit](https://docs.fluentbit.io/manual/pipeline/outputs/forward/) to forward://otel.highlight.io:24224.',
			code: {
				text: `bin/fluent-bit -i cpu -t fluent_bit -o forward://otel.highlight.io:24224`,
				language: 'bash',
			},
		},
		verifyLogs,
	],
}
