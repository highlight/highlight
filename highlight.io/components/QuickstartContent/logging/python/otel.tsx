import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'
import pythonOtelTraceCode from './python_otel_trace.snippet.py'
import pythonOtelLogCode from './python_otel_log.snippet.py'

export const PythonOtelLogContent: QuickStartContent = {
	title: 'Sending and Filtering Python Logs with OpenTelemetry',
	subtitle:
		'Learn how to set up highlight.io with logs from Python using OpenTelemetry.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		{
			title: 'Set up OpenTelemetry for logging.',
			content:
				'Configure OpenTelemetry to send logs to highlight.io without requiring the Highlight SDK.',
			code: [
				{
					text: pythonOtelLogCode,
					language: 'python',
				},
			],
		},
		{
			title: 'Set up OpenTelemetry for tracing.',
			content:
				'Configure OpenTelemetry to send traces to highlight.io without requiring the Highlight SDK.',
			code: [
				{
					text: pythonOtelTraceCode,
					language: 'python',
				},
			],
		},
		{
			title: 'Send logs and traces using OpenTelemetry!',
			content:
				'Logs and traces are reported automatically from OpenTelemetry logging and tracing methods. ' +
				'Visit the [highlight logs portal](https://app.highlight.io/logs) and check that backend logs are coming in.',
			code: [
				{
					text: `import logging
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def main():
    with tracer.start_as_current_span("example-span"):
        logger.info('hello, world!')
        logger.warning('whoa there', {'key': 'value'})`,
					language: 'python',
				},
			],
		},
		verifyLogs,
	],
}
