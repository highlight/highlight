import sys

import highlight_io
from highlight_io.integrations import Integration

try:
    from django import VERSION as DJANGO_VERSION
    from django.conf import settings as django_settings
    from django.core import signals
    from django.core.handlers.wsgi import WSGIHandler
    from django.core.handlers.asgi import ASGIHandler

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
        self._orig_django_wsgi = None
        self._orig_django_asgi = None

    def enable(self):
        self._orig_django_wsgi = WSGIHandler.__call__
        self._orig_django_asgi = ASGIHandler.__call__

        def wrapped_wsgi_call(app, environ, start_response):
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
                return self._orig_django_wsgi(app, environ, start_response)

        async def wrapped_asgi_call(app, scope, receive, send):
            session_id, request_id = "", ""
            try:
                headers = dict(scope.get("headers", []))
                highlight_header = headers.get(
                    DjangoIntegration.HIGHLIGHT_HEADER.encode()
                )
                if highlight_header:
                    session_id, request_id = highlight_header.decode().split("/")
            except (KeyError, ValueError):
                pass

            span_name = f"{scope.get('method')} {scope.get('path')}"
            qs = scope.get("query_string", b"").decode()
            if qs:
                span_name = f"{span_name}?{qs}"
            with highlight_io.H.get_instance().trace(span_name, session_id, request_id):
                return await self._orig_django_asgi(app, scope, receive, send)

        WSGIHandler.__call__ = wrapped_wsgi_call
        ASGIHandler.__call__ = wrapped_asgi_call

        signals.got_request_exception.connect(self._exception_handler)

    def disable(self):
        signals.got_request_exception.disconnect(self._exception_handler)
        WSGIHandler.__call__ = self._orig_django_wsgi
        ASGIHandler.__call__ = self._orig_django_asgi
        self._orig_django_wsgi = None
        self._orig_django_asgi = None

    @staticmethod
    def _exception_handler(*args, **kwargs):
        _, exc, _ = sys.exc_info()
        highlight_io.H.get_instance().record_exception(exc)
