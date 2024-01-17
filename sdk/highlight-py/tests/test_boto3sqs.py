from highlight_io.integrations.boto3sqs import Boto3SQSIntegration


def test_boto3sqs():
    integration = Boto3SQSIntegration()
    integration.enable()
    integration.disable()
