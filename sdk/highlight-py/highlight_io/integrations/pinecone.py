from highlight_io.integrations import Integration


class PineconeIntegration(Integration):
    INTEGRATION_KEY = "pinecone"

    def instrumentor(self):
        from opentelemetry.instrumentation.pinecone import PineconeInstrumentor

        return PineconeInstrumentor()
