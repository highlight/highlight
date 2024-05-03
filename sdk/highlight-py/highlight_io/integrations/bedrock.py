from opentelemetry.instrumentation.bedrock import BedrockInstrumentor

from highlight_io.integrations import Integration


class BedrockIntegration(Integration):
    INTEGRATION_KEY = "bedrock"

    def enable(self):
        BedrockInstrumentor().instrument()

    def disable(self):
        BedrockInstrumentor().uninstrument()
