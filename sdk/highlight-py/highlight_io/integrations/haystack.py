from highlight_io.integrations import Integration


class HaystackIntegration(Integration):
    INTEGRATION_KEY = "haystack"

    def instrumentor(self):
        from opentelemetry.instrumentation.haystack import HaystackInstrumentor

        return HaystackInstrumentor()
