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
				'Route your [fluentd / fluent bit](https://docs.fluentbit.io/manual/pipeline/outputs/forward/) to forward://otel.highlight.io:24224. ' +
				'Regardless of the  way you are using fluentbit, configure the tag to `highlight.project_id=YOUR_PROJECT_ID` to route the logs to the given highlight project',
			code: [
				{
					text: `bin/fluent-bit -i cpu -t highlight.project_id=YOUR_PROJECT_ID -o forward://otel.highlight.io:24224`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Setting up for AWS ECS?',
			content:
				'If you are setting up for AWS Elastic Container Services, check out our dedicated [docs for AWS ECS.](/docs/getting-started/backend-logging/hosting/aws#aws-ecs-containers) .',
		},
		verifyLogs,
	],
}
