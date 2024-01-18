from highlight_io.integrations import Integration

try:
    import sqlalchemy
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class SQLAlchemyIntegration(Integration):
    INTEGRATION_KEY = "sqlalchemy"

    def enable(self):
        if instrumentation_available:
            SQLAlchemyInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            SQLAlchemyInstrumentor().uninstrument()
