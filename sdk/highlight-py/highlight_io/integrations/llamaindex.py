from highlight_io.integrations import Integration


class LlamaIndexIntegration(Integration):
    INTEGRATION_KEY = "llamaindex"

    def instrumentor(self):
        from opentelemetry.instrumentation.llamaindex import LlamaIndexInstrumentor

        return LlamaIndexInstrumentor()
