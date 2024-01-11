from highlight_io.integrations import Integration

try:
    import redis
    from opentelemetry.instrumentation.redis import RedisInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class RedisIntegration(Integration):
    INTEGRATION_KEY = "redis"

    def enable(self):
        if instrumentation_available:
            RedisInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            RedisInstrumentor().uninstrument()
