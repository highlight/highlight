from opentelemetry.instrumentation.llamaindex import LlamaIndexInstrumentor

from highlight_io.integrations import Integration


class LlamaIndexIntegration(Integration):
    INTEGRATION_KEY = "llamaindex"

    def enable(self):
        LlamaIndexInstrumentor().instrument()

    def disable(self):
        LlamaIndexInstrumentor().uninstrument()
