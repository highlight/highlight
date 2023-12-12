import typing as t

import highlight_io
from highlight_io.integrations import Integration

from opentelemetry.instrumentation.requests import RequestsInstrumentor


class RequestsIntegration(Integration):
    def enable(self):
        RequestsInstrumentor().instrument(request_hook=request_hook)

    def disable(self):
        RequestsInstrumentor().uninstrument()


def request_hook(span, request):
    instance = highlight_io.H.get_instance()
    session_id, request_id = instance.get_highlight_context(span.context.trace_id)

    if instance.trace_origin_url(request.url):
        request.headers[instance.REQUEST_HEADER] = "{session_id}/{request_id}"

    span.set_attributes({"highlight.project_id": instance._project_id})
    span.set_attributes({"highlight.trace_id": request_id})
    span.set_attributes({"highlight.session_id": session_id})
