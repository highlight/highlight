from highlight_io.integrations import Integration

from opentelemetry.instrumentation.haystack import HaystackInstrumentor


class HaystackIntegration(Integration):
    INTEGRATION_KEY = "haystack"

    def enable(self):
        HaystackInstrumentor().instrument()

    def disable(self):
        HaystackInstrumentor().uninstrument()
