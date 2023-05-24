import { QuickStartContent } from '../QuickstartContent'
import { curlExample, verifyLogs } from './shared-snippets'

export const FileContent: QuickStartContent = {
	title: 'File',
	subtitle:
		'Set up highlight.io log ingestion for any log file using an OpenTelemetry collector with the filelog receiver.',
	entries: [
		{
			title: 'Define your OpenTelemetry configuration.',
			content:
				'Setup the following OpenTelemetry collector. Check out our [example here](https://github.com/highlight/highlight/tree/main/e2e/opentelemetry/filelog).',
			code: {
				text: `receivers:
    filelog:
        include: [/watch.log]
        start_at: beginning
exporters:
    otlp/highlight:
        endpoint: 'https://otel.highlight.io:4317'
processors:
    attributes/highlight-project:
        actions:
            - key: highlight.project_id
              value: '<YOUR_PROJECT_ID>'
              action: insert
    batch:
service:
    pipelines:
        logs:
            receivers: [filelog]
            processors: [attributes/highlight-project, batch]
            exporters: [otlp/highlight]
`,
				language: 'yaml',
			},
		},
		{
			title: 'Run the collector',
			content:
				'Run the [OpenTelemetry collector](https://opentelemetry.io/docs/collector/getting-started/) to start streaming the file to highlight.',
			code: {
				text: `docker run -v /my/file/to/watch.log:/watch.log -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib`,
				language: 'bash',
			},
		},
		verifyLogs,
	],
}
