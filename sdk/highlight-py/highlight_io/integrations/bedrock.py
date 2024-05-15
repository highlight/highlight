from highlight_io.integrations import Integration


class BedrockIntegration(Integration):
    INTEGRATION_KEY = "bedrock"

    def instrumentor(self):
        from opentelemetry.instrumentation.bedrock import BedrockInstrumentor

        return BedrockInstrumentor()
