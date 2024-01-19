from highlight_io.integrations.sqlalchemy import SQLAlchemyIntegration


def test_sqlalchemy():
    integration = SQLAlchemyIntegration()
    integration.enable()
    integration.disable()
