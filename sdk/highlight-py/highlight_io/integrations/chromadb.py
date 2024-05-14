from highlight_io.integrations import Integration


class ChromadbIntegration(Integration):
    INTEGRATION_KEY = "chromadb"

    def instrumentor(self):
        from opentelemetry.instrumentation.chromadb import ChromaInstrumentor

        return ChromaInstrumentor()
