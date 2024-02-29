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
			title: 'Running the fluent agent.',
			content:
				'You may be running a fluent agent locally or [in docker](https://hub.docker.com/r/fluent/fluent-bit/). In that case, you would use the fluent-bit.conf',
			code: [
				{
					text: `[INPUT]
    name                tail
    tag                 <YOUR_PROJECT_ID>
    path                /var/log/your_log_file.log
    path_key            file_path

[INPUT]
    name                tail
    tag                 <YOUR_PROJECT_ID>
    path                /var/log/nginx/another_log_file.txt
    path_key            file_path

[FILTER]
    Name                record_modifier
    Match               *
    Record              hostname my-hostname

[OUTPUT]
    Name                forward
    Match               *
    Host                otel.highlight.io
    Port                24224
`,
					language: 'yaml',
				},
			],
		},
		{
			title: '(Optional) Configure Fluent Forward over TLS.',
			content:
				'If you want to transfer data over a secure TLS connection, change the `[OUTPUT]` to the following (using port 24284)',
			code: [
				{
					text: `[OUTPUT]
    Name                forward
    Match               *
    Host                otel.highlight.io
    Port                24284
    tls                 on
    tls.verify          on
`,
					language: 'yaml',
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
