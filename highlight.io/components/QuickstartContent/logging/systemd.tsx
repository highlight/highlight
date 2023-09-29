import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const SystemdContent: QuickStartContent = {
	title: 'Shipping Systemd Structured Logs',
	subtitle: 'Configure Systemd to ship logs to highlight.',
	entries: [
		{
			title: 'Install OpenTelemetry Collector Contrib locally',
			content:
				'[See here](https://opentelemetry.io/docs/collector/getting-started/#linux-packaging) for instructions on installing the collector. ' +
				'We assume that systemd/systemctl are already set up. ' +
				'Check out the following [OpenTelemetry journald receiver docs](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/189a64b21cfd67998b334228a423595591dedae0/receiver/journaldreceiver#setup-and-deployment) ' +
				'that provide additional guidance on installation.',
		},
		{
			title: 'Define your OpenTelemetry configuration.',
			content:
				'Setup the Contrib OpenTelemetry collector. Check out our [example here](https://github.com/highlight/highlight/tree/main/e2e/opentelemetry/journald). ' +
				'Make sure that the journald directory is correct for your systemd/systemctl setup.',
			code: [
				{
					text: `receivers:
    journald:
        directory: /var/log/journal
exporters:
    logging:
        sampling_initial: 10
        sampling_thereafter: 1000
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
            receivers: [journald]
            processors: [attributes/highlight-project, batch]
            exporters: [otlp/highlight, logging]
`,
					language: 'yaml',
				},
			],
		},
		{
			title: 'Run the collector',
			content:
				'Run the [OpenTelemetry collector](https://opentelemetry.io/docs/collector/getting-started/) to start streaming the logs to highlight.',
			code: [
				{
					text: `./otelcol-contrib --config=config.yaml`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
