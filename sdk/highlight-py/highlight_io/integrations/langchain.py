from highlight_io.integrations import Integration


class LangchainIntegration(Integration):
    INTEGRATION_KEY = "langchain"

    def instrumentor(self):
        from opentelemetry.instrumentation.langchain import LangchainInstrumentor

        return LangchainInstrumentor()
