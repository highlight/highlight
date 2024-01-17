from highlight_io.integrations import Integration

try:
    import boto3
    from opentelemetry.instrumentation.boto3sqs import Boto3SQSInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class Boto3SQSIntegration(Integration):
    INTEGRATION_KEY = "boto3sqs"

    def enable(self):
        if instrumentation_available:
            Boto3SQSInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            Boto3SQSInstrumentor().uninstrument()
