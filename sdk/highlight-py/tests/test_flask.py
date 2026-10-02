from highlight_io.integrations.flask import FlaskIntegration


from flask import render_template

def test_flask():
    integration = FlaskIntegration()
    integration.enable()
    integration.disable()
