from opentelemetry.instrumentation.openai import OpenAIInstrumentor

from highlight_io.integrations import Integration


class OpenAIIntegration(Integration):
    INTEGRATION_KEY = "openai"

    def enable(self):
        OpenAIInstrumentor().instrument()

    def disable(self):
        OpenAIInstrumentor().uninstrument()
