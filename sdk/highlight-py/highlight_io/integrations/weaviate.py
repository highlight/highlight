from opentelemetry.instrumentation.weaviate import WeaviateInstrumentor

from highlight_io.integrations import Integration


class WeaviateIntegration(Integration):
    INTEGRATION_KEY = "weaviate"

    def enable(self):
        WeaviateInstrumentor().instrument()

    def disable(self):
        WeaviateInstrumentor().uninstrument()
