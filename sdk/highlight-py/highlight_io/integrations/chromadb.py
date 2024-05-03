from opentelemetry.instrumentation.chromadb import ChromaInstrumentor

from highlight_io.integrations import Integration


class ChromadbIntegration(Integration):
    INTEGRATION_KEY = "chromadb"

    def enable(self):
        ChromaInstrumentor().instrument()

    def disable(self):
        ChromaInstrumentor().uninstrument()
