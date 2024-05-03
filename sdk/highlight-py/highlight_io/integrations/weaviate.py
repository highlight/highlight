from highlight_io.integrations import Integration


class WeaviateIntegration(Integration):
    INTEGRATION_KEY = "weaviate"

    def instrumentor(self):
        from opentelemetry.instrumentation.weaviate import WeaviateInstrumentor

        return WeaviateInstrumentor()
