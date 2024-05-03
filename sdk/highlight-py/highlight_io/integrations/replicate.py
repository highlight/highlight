from opentelemetry.instrumentation.replicate import ReplicateInstrumentor

from highlight_io.integrations import Integration


class ReplicateIntegration(Integration):
    INTEGRATION_KEY = "replicate"

    def enable(self):
        ReplicateInstrumentor().instrument()

    def disable(self):
        ReplicateInstrumentor().uninstrument()
