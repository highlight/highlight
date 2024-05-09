from highlight_io.integrations import Integration


class QdrantInstrumentation(Integration):
    INTEGRATION_KEY = "qdrant"

    def instrumentor(self):
        from opentelemetry.instrumentation.qdrant import QdrantInstrumentor

        return QdrantInstrumentor()
