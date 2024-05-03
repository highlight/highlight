from highlight_io.integrations import Integration

from opentelemetry.instrumentation.langchain import LangchainInstrumentor


class LangchainIntegration(Integration):
    INTEGRATION_KEY = "langchain"

    def enable(self):
        LangchainInstrumentor().instrument()

    def disable(self):
        LangchainInstrumentor().uninstrument()
