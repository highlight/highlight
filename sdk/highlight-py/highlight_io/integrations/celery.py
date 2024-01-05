import typing as t

import highlight_io
from highlight_io.integrations import Integration
from highlight_io.utils import utils

try:
    import celery
    from opentelemetry.instrumentation.celery import CeleryInstrumentor

    instrumentation_available = True
except ImportError:
    instrumentation_available = False


class CeleryIntegration(Integration):
    INTEGRATION_KEY = "celery"

    def __init__(self, tracing_origins: t.Optional[t.List[str] | bool] = None):
        self._trace_origins = tracing_origins or False

    def enable(self):
        if instrumentation_available:
            CeleryInstrumentor().instrument()

    def disable(self):
        if instrumentation_available:
            CeleryInstrumentor().uninstrument()
