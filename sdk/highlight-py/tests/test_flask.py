from highlight_io.integrations.flask import FlaskIntegration


def test_flask():
    integration = FlaskIntegration()
    integration.enable()
    integration.disable()
