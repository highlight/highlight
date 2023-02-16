from highlight_io.integrations.django import DjangoIntegration


def test_django():
    integration = DjangoIntegration()
    integration.enable()
    integration.disable()
