from highlight_io.integrations import Integration


class TransformersIntegration(Integration):
    INTEGRATION_KEY = "transformers"

    def instrumentor(self):
        from opentelemetry.instrumentation.transformers import TransformersInstrumentor

        return TransformersInstrumentor()
