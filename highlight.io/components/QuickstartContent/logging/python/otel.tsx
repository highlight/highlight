import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

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
					text: `
import logging
from opentelemetry import trace
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

import sys

# Define the service name and environment
service_name = "my-service"
environment = "production"
otel_endpoint = "https://otel.highlight.io:4317"

# Set up the logger provider with the resource
logger_provider = LoggerProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": environment,
    }
))
set_logger_provider(logger_provider)

# Configure the OTLP log exporter
exporter = OTLPLogExporter(endpoint=otel_endpoint, insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

# Set up the logger
logger = logging.getLogger(service_name)
logger.setLevel(logging.DEBUG)

# Add the OpenTelemetry logging handler
handler = LoggingHandler(level=logging.DEBUG, logger_provider=logger_provider)
logger.addHandler(handler)

# Add console handler for stdout (optional)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
					`,
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
					text: `
import logging
from opentelemetry import trace
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

import sys

# Define the service name and environment
service_name = "my-service"
environment = "production"
otel_endpoint = "https://otel.highlight.io:4317"

# Create a resource with service name and highlight project ID
provider = TracerProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": environment,
    }
))
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=otel_endpoint, insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(service_name)

					`,
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
					text: `
...

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
