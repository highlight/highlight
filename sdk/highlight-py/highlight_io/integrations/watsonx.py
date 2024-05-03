from opentelemetry.instrumentation.watsonx import WatsonxInstrumentor

from highlight_io.integrations import Integration


class WatsonXIntegration(Integration):
    INTEGRATION_KEY = "watsonx"

    def enable(self):
        WatsonxInstrumentor().instrument()

    def disable(self):
        WatsonxInstrumentor().uninstrument()
