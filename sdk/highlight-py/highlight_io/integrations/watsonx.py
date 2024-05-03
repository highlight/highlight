from highlight_io.integrations import Integration


class WatsonXIntegration(Integration):
    INTEGRATION_KEY = "watsonx"

    def instrumentor(self):
        from opentelemetry.instrumentation.watsonx import WatsonxInstrumentor

        return WatsonxInstrumentor()
