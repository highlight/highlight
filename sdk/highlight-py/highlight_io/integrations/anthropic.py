from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor

from highlight_io.integrations import Integration


class AnthropicIntegration(Integration):
    INTEGRATION_KEY = "anthropic"

    def enable(self):
        AnthropicInstrumentor().instrument()

    def disable(self):
        AnthropicInstrumentor().uninstrument()
