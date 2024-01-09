from highlight_io.integrations.requests import RequestsIntegration


def test_requests():
    integration = RequestsIntegration()
    integration.enable()
    integration.disable()
