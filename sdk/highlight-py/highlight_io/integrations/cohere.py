from highlight_io.integrations import Integration


class CohereIntegration(Integration):
    INTEGRATION_KEY = "cohere"

    def instrumentor(self):
        from opentelemetry.instrumentation.cohere import CohereInstrumentor

        return CohereInstrumentor()
