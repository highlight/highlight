from highlight_io.integrations import Integration


class CeleryIntegration(Integration):
    INTEGRATION_KEY = "celery"

    def instrumentor(self):
        from opentelemetry.instrumentation.celery import CeleryInstrumentor

        return CeleryInstrumentor()
