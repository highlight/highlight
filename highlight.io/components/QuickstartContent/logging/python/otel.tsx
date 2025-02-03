import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../../traces/shared-snippets'
import { verifyLogs, verifyMetrics } from '../shared-snippets'

export const PythonOtelLogContent: QuickStartContent = {
	title: 'Logging with OpenTelemetry in Python',
	subtitle:
		'Learn how to set up highlight.io with logs from Python using OpenTelemetry.',
	entries: [
		{
			title: 'Install OpenTelemetry',
			content: 'Install OpenTelemetry in your Python environment.',
			code: [
				{
					text: `pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp opentelemetry-instrumentation`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Set up OpenTelemetry for logging.',
			content:
				'Configure OpenTelemetry to send logs to highlight.io without requiring the Highlight SDK.',
			code: [
				{
					text: `import logging
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource

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
		verifyLogs,
		{
			title: 'Set up OpenTelemetry for tracing.',
			content:
				'Configure OpenTelemetry to send traces to highlight.io without requiring the Highlight SDK.',
			code: [
				{
					text: `from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

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
		verifyTraces,
		{
			title: 'Send metrics using OpenTelemetry',
			content:
				'Metrics are reported via OpenTelemetry metrics methods; this example will send a simple count metric. For a full guide on how to send metrics, check out the [OpenTelemetry Python docs](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html).',
			code: [
				{
					text: `from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.resources import Resource

service_name = "my-service"
environment = "production"
otel_endpoint = "https://otel.highlight.io:4317"

otlp_metric_reader = PeriodicExportingMetricReader(exporter=OTLPMetricExporter(endpoint=otel_endpoint, insecure=True),
                                                   export_interval_millis=1000)

# create a provider
provider = MeterProvider(resource=Resource.create(
    {
        "service.name": service_name,
        "highlight.project_id": "<YOUR_PROJECT_ID>",
        "environment": environment,
    }
), metric_readers=[otlp_metric_reader])

# Create a meter
meter = provider.get_meter(service_name)

# Create a counter
counter = meter.create_counter(name="my_counter", description="A simple counter")

# Increment the counter
counter.add(1)
					`,
					language: 'python',
				},
			],
		},
		verifyMetrics,
	],
}
