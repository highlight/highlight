from highlight_io.integrations import Integration


class OpenAIIntegration(Integration):
    INTEGRATION_KEY = "openai"

    def instrumentor(self):
        from opentelemetry.instrumentation.openai import OpenAIInstrumentor

        return OpenAIInstrumentor()
