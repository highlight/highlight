from highlight_io.integrations.boto import BotoIntegration


def test_boto():
    integration = BotoIntegration()
    integration.enable()
    integration.disable()
