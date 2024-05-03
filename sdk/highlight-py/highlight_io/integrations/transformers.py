from opentelemetry.instrumentation.transformers import TransformersInstrumentor

from highlight_io.integrations import Integration


class TransformersIntegration(Integration):
    INTEGRATION_KEY = "transformers"

    def enable(self):
        TransformersInstrumentor().instrument()

    def disable(self):
        TransformersInstrumentor().uninstrument()
