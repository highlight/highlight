import sys

import highlight_io
from highlight_io.integrations import Integration

try:
    from django import VERSION as DJANGO_VERSION
    from django.conf import settings as django_settings
    from django.core import signals
    from django.core.handlers.wsgi import WSGIHandler

    try:
        from django.urls import resolve
    except ImportError:
        from django.core.urlresolvers import resolve
except ImportError:
    raise NotImplementedError("Django not installed")


class DjangoIntegration(Integration):
    HIGHLIGHT_HEADER = "HTTP_X_HIGHLIGHT_REQUEST"
    INTEGRATION_KEY = "django"

    def __init__(self):
        self._orig_django = None

    def enable(self):
        self._orig_django = WSGIHandler.__call__

        def wrapped_call(app, environ, start_response):
            session_id, request_id = "", ""
            try:
                session_id, request_id = str(
                    environ[DjangoIntegration.HIGHLIGHT_HEADER]
                ).split("/")
            except (KeyError, ValueError):
                pass

            span_name = f"{environ.get('REQUEST_METHOD')} {environ.get('PATH_INFO')}"
            qs = environ.get("QUERY_STRING")
            if qs:
                span_name = f"{span_name}?{qs}"
            with highlight_io.H.get_instance().trace(span_name, session_id, request_id):
                return self._orig_django(app, environ, start_response)

        WSGIHandler.__call__ = wrapped_call

        signals.got_request_exception.connect(self._exception_handler)

    def disable(self):
        signals.got_request_exception.disconnect(self._exception_handler)
        WSGIHandler.__call__ = self._orig_django
        self._orig_django = None

    @staticmethod
    def _exception_handler(*args, **kwargs):
        _, exc, _ = sys.exc_info()
        highlight_io.H.get_instance().record_exception(exc)
