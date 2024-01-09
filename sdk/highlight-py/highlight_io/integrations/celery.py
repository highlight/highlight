from highlight_io.integrations import Integration

try:
    import celery
    from opentelemetry.instrumentation.celery import CeleryInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class CeleryIntegration(Integration):
    INTEGRATION_KEY = "celery"

    def enable(self):
        if instrumentation_available:
            CeleryInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            CeleryInstrumentor().uninstrument()
