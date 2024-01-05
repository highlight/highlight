import typing as t

import highlight_io
from highlight_io.integrations import Integration
from highlight_io.utils import utils

try:
    import requests
    from opentelemetry.instrumentation.requests import RequestsInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class RequestsIntegration(Integration):
    INTEGRATION_KEY = "requests"

    def enable(self):
        if instrumentation_available:
            RequestsInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            RequestsInstrumentor().uninstrument()
