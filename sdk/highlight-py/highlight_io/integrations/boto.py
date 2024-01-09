from highlight_io.integrations import Integration

try:
    import boto
    from opentelemetry.instrumentation.boto import BotoInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class BotoIntegration(Integration):
    INTEGRATION_KEY = "boto"

    def enable(self):
        if instrumentation_available:
            BotoInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            BotoInstrumentor().uninstrument()
