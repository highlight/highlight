from opentelemetry.instrumentation.pinecone import PineconeInstrumentor

from highlight_io.integrations import Integration


class PineconeIntegration(Integration):
    INTEGRATION_KEY = "pinecone"

    def enable(self):
        PineconeInstrumentor().instrument()

    def disable(self):
        PineconeInstrumentor().uninstrument()
