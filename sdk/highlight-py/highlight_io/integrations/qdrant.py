from opentelemetry.instrumentation.qdrant import QdrantInstrumentor

from highlight_io.integrations import Integration


class QdrantInstrumentation(Integration):
    INTEGRATION_KEY = "qdrant"

    def enable(self):
        QdrantInstrumentor().instrument()

    def disable(self):
        QdrantInstrumentor().uninstrument()
