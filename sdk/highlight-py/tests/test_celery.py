from highlight_io.integrations.celery import CeleryIntegration


def test_celery():
    integration = CeleryIntegration()
    integration.enable()
    integration.disable()
