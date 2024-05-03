from highlight_io.integrations import Integration


class VertexAIIntegration(Integration):
    INTEGRATION_KEY = "vertexai"

    def instrumentor(self):
        from opentelemetry.instrumentation.vertexai import VertexAIInstrumentor

        return VertexAIInstrumentor()
