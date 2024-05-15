from highlight_io.integrations import Integration


class BotoIntegration(Integration):
    INTEGRATION_KEY = "boto"

    def instrumentor(self):
        from opentelemetry.instrumentation.boto import BotoInstrumentor

        return BotoInstrumentor()
