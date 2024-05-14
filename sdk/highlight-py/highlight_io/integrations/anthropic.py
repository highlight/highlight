from highlight_io.integrations import Integration


class AnthropicIntegration(Integration):
    INTEGRATION_KEY = "anthropic"

    def instrumentor(self):
        from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor

        return AnthropicInstrumentor()
