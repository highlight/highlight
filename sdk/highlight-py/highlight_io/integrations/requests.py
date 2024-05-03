from highlight_io.integrations import Integration


class RequestsIntegration(Integration):
    INTEGRATION_KEY = "requests"

    def instrumentor(self):
        from opentelemetry.instrumentation.requests import RequestsInstrumentor

        return RequestsInstrumentor()
