from highlight_io.integrations import Integration


class SQLAlchemyIntegration(Integration):
    INTEGRATION_KEY = "sqlalchemy"

    def instrumentor(self):
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

        return SQLAlchemyInstrumentor()
