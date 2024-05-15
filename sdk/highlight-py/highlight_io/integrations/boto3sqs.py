from highlight_io.integrations import Integration


class Boto3SQSIntegration(Integration):
    INTEGRATION_KEY = "boto3sqs"

    def instrumentor(self):
        from opentelemetry.instrumentation.boto3sqs import Boto3SQSInstrumentor

        return Boto3SQSInstrumentor()
