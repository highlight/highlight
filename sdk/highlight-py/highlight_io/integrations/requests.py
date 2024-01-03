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

    def __init__(self, tracing_origins: t.Optional[t.List[str] | bool] = None):
        self._trace_origins = tracing_origins or False

    def enable(self):
        if instrumentation_available:
            RequestsInstrumentor().instrument(request_hook=self.request_hook)

    def disable(self):
        if instrumentation_available:
            RequestsInstrumentor().uninstrument()

    def request_hook(self, span, request):
        instance = highlight_io.H.get_instance()
        session_id, request_id = instance.get_highlight_context(span.context.trace_id)

        if utils.trace_origin_url(self._trace_origins, request.url):
            request.headers[instance.REQUEST_HEADER] = "{session_id}/{request_id}"

        span.set_attributes({"highlight.project_id": instance._project_id})
        span.set_attributes({"highlight.trace_id": request_id})
        span.set_attributes({"highlight.session_id": session_id})
