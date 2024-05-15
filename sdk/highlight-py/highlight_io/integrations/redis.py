from highlight_io.integrations import Integration


class RedisIntegration(Integration):
    INTEGRATION_KEY = "redis"

    def instrumentor(self):
        from opentelemetry.instrumentation.redis import RedisInstrumentor

        return RedisInstrumentor()
