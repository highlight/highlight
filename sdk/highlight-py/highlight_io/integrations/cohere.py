from opentelemetry.instrumentation.cohere import CohereInstrumentor

from highlight_io.integrations import Integration


class CohereIntegration(Integration):
    INTEGRATION_KEY = "cohere"

    def enable(self):
        CohereInstrumentor().instrument()

    def disable(self):
        CohereInstrumentor().uninstrument()
