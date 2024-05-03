from opentelemetry.instrumentation.vertexai import VertexAIInstrumentor

from highlight_io.integrations import Integration


class VertexAIIntegration(Integration):
    INTEGRATION_KEY = "vertexai"

    def enable(self):
        VertexAIInstrumentor().instrument()

    def disable(self):
        VertexAIInstrumentor().uninstrument()
