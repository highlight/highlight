from highlight_io.integrations import Integration


class ReplicateIntegration(Integration):
    INTEGRATION_KEY = "replicate"

    def instrumentor(self):
        from opentelemetry.instrumentation.replicate import ReplicateInstrumentor

        return ReplicateInstrumentor()
