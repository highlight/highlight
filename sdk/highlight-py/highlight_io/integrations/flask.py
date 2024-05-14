import typing
import typing as t

import highlight_io

from highlight_io.integrations import Integration

try:
    from flask import Flask, request
    from flask.signals import got_request_exception
except ImportError:
    raise NotImplementedError("flask is not installed")

try:
    import blinker
except ImportError:
    raise NotImplementedError("blinked is not installed")


class FlaskIntegration(Integration):
    HIGHLIGHT_HEADER = "HTTP_X_HIGHLIGHT_REQUEST"
    INTEGRATION_KEY = "flask"

    def __init__(self):
        self._orig_flask = None

    def enable(self):
        self._orig_flask = Flask.__call__

        def wrapped_call(app: Flask, environ: t.Dict, start_response: t.Callable):
            session_id, request_id = "", ""
            try:
                session_id, request_id = str(
                    environ[FlaskIntegration.HIGHLIGHT_HEADER]
                ).split("/")
            except (KeyError, ValueError):
                pass

            span_name = f"{environ.get('REQUEST_METHOD')} {environ.get('REQUEST_URI')}"
            with highlight_io.H.get_instance().trace(span_name, session_id, request_id):
                return self._orig_flask(app, environ, start_response)

        Flask.__call__ = wrapped_call

        got_request_exception.connect(self.exception_handler)

    def disable(self):
        got_request_exception.disconnect(self.exception_handler)
        Flask.__call__ = self._orig_flask
        self._orig_flask = None

    @staticmethod
    def exception_handler(_: Flask, exception: typing.Optional[Exception] = None):
        highlight_io.H.get_instance().record_exception(exception)
