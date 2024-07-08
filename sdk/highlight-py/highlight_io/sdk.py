import contextlib
import http
import json
import logging
import sys
import traceback
import typing

from opentelemetry import trace as otel_trace, _logs
from opentelemetry._logs.severity import std_to_otel
from opentelemetry.baggage import set_baggage, get_baggage
from opentelemetry.context import Context, attach, get_current
from opentelemetry.exporter.otlp.proto.http import Compression
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk._logs import (
    LoggerProvider,
    LogRecord,
)
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider, Span, SpanProcessor
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.semconv.trace import SpanAttributes
from opentelemetry.trace import INVALID_SPAN

from highlight_io.integrations import Integration
from highlight_io.integrations.all import DEFAULT_INTEGRATIONS
from highlight_io.utils.lru_cache import LRUCache


class LogHandler(logging.Handler):
    def __init__(self, highlight: "H", level=logging.NOTSET):
        """Create a `logging.Handler` that ships data to highlight.
        :param highlight: Highlight object
        :param level: Log level

        Example:
            # define the formatting for logs sent to highlight
            formatter = logging.Formatter(' %(name)s :: %(levelname)-8s :: %(message)s')
            handler = LogHandler(H)
            handler.setFormatter(formatter)
            # create the logger object with a custom logger module name
            lg = logging.getLogger("my.logger")
            lg.addHandler(handler)

            lg.warning("oh, no!")
        """
        self.highlight = highlight
        super(LogHandler, self).__init__(level=level)

    def emit(self, record: logging.LogRecord):
        ctx = contextlib.nullcontext
        span = otel_trace.get_current_span()

        if span is None or not span.is_recording():
            ctx = self.highlight.trace

        with ctx():
            if self.filter(record):
                self.highlight.log_hook(
                    otel_trace.get_current_span(), record, formatted=self.format(record)
                )


class H(object):
    REQUEST_HEADER = "X-Highlight-Request"
    OTLP_HTTP = "https://otel.highlight.io:4318"
    _instance: "H" = None
    _logging_instrumented = False
    # context is a LRU cache to avoid storing too many trace ids in memory
    # we should not need more than 1000 since Python processes are single-threaded
    # context map is a cache of trace ids to (session_id, request_id) tuples
    _context_map = LRUCache(1000)

    @classmethod
    def get_instance(cls) -> "H":
        if not cls._instance:
            raise NotImplementedError(
                "highlight_io H object is not configured, please instantiate it by calling H()"
            )
        return cls._instance

    def __init__(
        self,
        project_id: str,
        integrations: typing.List[Integration] = None,
        disabled_integrations: typing.List[str] = None,
        otlp_endpoint: str = "",
        instrument_logging: bool = True,
        log_level=logging.DEBUG,
        service_name: str = "",
        service_version: str = "",
        environment: str = "",
        disable_export_error_logging: bool = False,
        debug: bool = False,
        **kwargs,
    ):
        """
        Setup Highlight backend instrumentation.

        Example:
            import highlight_io
            H = highlight_io.H('project_id', ...)


        :param project_id: a string that corresponds to the verbose id of your project from app.highlight.io/setup
        :param integrations: a list of Integrations that allow connecting with your framework, like Flask or Django.
        :param disabled_integrations: a list of integrations to disable.
        :param instrument_logging: defaults to True. set False to disable auto-instrumentation of python `logging` methods.
        :param otlp_endpoint: set to a custom otlp destination
        :param service_name: a string to name this app
        :param service_version: a string to set this app's version (typically a Git deploy sha).
        :param environment: a string to set this app's environment (e.g. 'production', 'development').
        :param debug: a boolean to turn on debug logging.
        :param **kwargs: optional kwargs passed to the BatchLogRecordProcessor and BatchSpanProcessor.
        :return: a configured H instance
        """
        kwargs.update(
            {
                "schedule_delay_millis": 1000,
                "max_export_batch_size": 128 * 1024,
                "max_queue_size": 1024 * 1024,
            }
        )

        if debug:
            root = logging.getLogger()
            root.setLevel(logging.DEBUG)
            handler = logging.StreamHandler(sys.stdout)
            handler.setLevel(logging.DEBUG)
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            root.addHandler(handler)

        if disable_export_error_logging:
            for logger_name in (
                "opentelemetry.exporter.otlp.proto.http._log_exporter",
                "opentelemetry.exporter.otlp.proto.http.trace_exporter",
                "opentelemetry.sdk._logs._internal.export",
                "opentelemetry.sdk.trace.export",
            ):
                logging.getLogger(logger_name).setLevel(logging.FATAL)

        logger = logging.getLogger("highlight_io")

        H._instance = self
        self._project_id = project_id
        self._integrations = integrations or []
        self._disabled_integrations = disabled_integrations or []
        self._otlp_endpoint = otlp_endpoint or H.OTLP_HTTP
        logger.debug(
            "Highlight initializing: %s %s %s",
            self._otlp_endpoint,
            self._project_id,
            kwargs,
        )
        self._log_handler = LogHandler(self, level=log_level)
        if instrument_logging:
            self._instrument_logging()

        class HighlightSpanProcessor(SpanProcessor):
            def on_start(
                self, span: Span, parent_context: typing.Optional[Context] = None
            ) -> None:
                session_id, request_id = "", ""
                try:
                    header_value = str(
                        get_baggage(H._instance.REQUEST_HEADER, parent_context)
                    )
                    session_id, request_id = header_value.split("/")
                except (AttributeError, KeyError, ValueError):
                    pass
                if not session_id or not request_id:
                    session_id, request_id = H._instance.get_highlight_context(
                        span.context.trace_id
                    )

                span.set_attributes(
                    {
                        "highlight.project_id": H._instance._project_id,
                        "highlight.trace_id": request_id,
                        "highlight.session_id": session_id,
                    }
                )
                attach(
                    set_baggage(
                        H._instance.REQUEST_HEADER, f"{session_id}/{request_id}"
                    )
                )

                return super().on_start(span, parent_context)

        resource = _build_resource(
            service_name=service_name,
            service_version=service_version,
            environment=environment,
        )
        self._trace_provider = TracerProvider(resource=resource)
        self._trace_provider.add_span_processor(HighlightSpanProcessor())
        self._trace_provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(
                    f"{self._otlp_endpoint}/v1/traces",
                    compression=Compression.Gzip,
                    timeout=30,
                ),
                **kwargs,
            )
        )
        otel_trace.set_tracer_provider(self._trace_provider)
        self.tracer = otel_trace.get_tracer(__name__)

        self._log_provider = LoggerProvider(
            resource=resource,
        )
        self._log_provider.add_log_record_processor(
            BatchLogRecordProcessor(
                OTLPLogExporter(
                    f"{self._otlp_endpoint}/v1/logs",
                    compression=Compression.Gzip,
                    timeout=30,
                ),
                **kwargs,
            )
        )
        _logs.set_logger_provider(self._log_provider)
        self.log = self._log_provider.get_logger(__name__)

        skip_disabled_integrations = self._disabled_integrations.copy()

        for integration in self._integrations:
            integration.enable()
            skip_disabled_integrations.append(integration.INTEGRATION_KEY)

        for integration in DEFAULT_INTEGRATIONS:
            if integration.INTEGRATION_KEY not in skip_disabled_integrations:
                integration().enable()

    def flush(self):
        self._trace_provider.force_flush()
        self._log_provider.force_flush()

    @contextlib.contextmanager
    def trace(
        self,
        span_name: typing.Optional[str] = "highlight.trace",
        session_id: typing.Optional[str] = "",
        request_id: typing.Optional[str] = "",
        attributes: typing.Optional[typing.Dict[str, any]] = None,
        context: typing.Optional[Context] = None,
    ) -> Span:
        """
        Catch exceptions raised by your app using this context manager.
        Exceptions will be recorded with the Highlight project and
        associated with a frontend session when headers are provided.

        Example:
            import highlight_io
            H = highlight_io.H('project_id', ...)

            def my_fn():
                with H.trace(headers={'X-Highlight-Request': '...'}):
                    raise Exception('fake error!')


        :param session_id: the highlight session that initiated this network request.
        :param request_id: the identifier of the current network request.
        :param span_name: span name to record.
        :param attributes: additional attributes to attribute to this error.
        :param context: `opentelemetry.Context` for multithreaded trace context propagation.
        :return: Span
        """
        # in case the otel library is in a non-recording context, do nothing
        if not hasattr(self, "tracer") or not self.tracer:
            yield
            return

        with self.tracer.start_as_current_span(
            span_name,
            record_exception=False,
            set_status_on_exception=False,
            context=context,
        ) as span:
            span.set_attributes({"highlight.project_id": self._project_id})
            span.set_attributes({"highlight.session_id": session_id})
            span.set_attributes({"highlight.trace_id": request_id})

            self._context_map.put(span.context.trace_id, (session_id, request_id))

            try:
                yield span
            except Exception as e:
                self.record_exception(e, attributes=attributes)
                raise

    @staticmethod
    def record_http_error(
        status_code: int,
        detail: str,
        attributes: typing.Optional[typing.Dict[str, any]] = None,
    ) -> None:
        """
        Record an http error from your app.

        Example:
            from fastapi import FastAPI, Request, HTTPException, APIRouter
            import highlight_io

            H = highlight_io.H('project_id', ...)

            app = FastAPI()
            app.add_middleware(FastAPIMiddleware)

            router = APIRouter()


            @router.get("/health")
            def health_check():
                with H.trace("health_check", session_id, request_id):
                    logging.info('hello, world!')
                    H.record_http_error(status_code=404)
                    raise HTTPException(status_code=404, detail="Item not found")


        :param status_code: the http status code to report
        :param detail: the error status details
        :param attributes: additional metadata to attribute to this error.
        :return: None
        """
        span = otel_trace.get_current_span()
        if not span:
            raise RuntimeError("H.record_http_error called without a span context")

        # try load json of the form `{"detail":"Item not found"}`
        try:
            body = json.loads(detail)
            if "detail" in body:
                detail = body["detail"]
        except ValueError:
            pass

        if not detail:
            detail = http.HTTPStatus(status_code).phrase

        # we cannot use `span.record_exception()` here because that uses `traceback.format_exc()` which
        # relies there being an exception raised. we manually `traceback.format_stack()` to get the current
        # execution stack for recording an http exception.
        attrs = {
            SpanAttributes.EXCEPTION_TYPE: "HTTPException",
            SpanAttributes.EXCEPTION_MESSAGE: detail,
            SpanAttributes.EXCEPTION_STACKTRACE: "".join(traceback.format_stack()),
            SpanAttributes.HTTP_STATUS_CODE: status_code,
            "http.response.detail": detail,
        }
        if attributes:
            attrs.update(attributes)
        for req in ("request", "response"):
            headers = attrs.pop(f"http.{req}.headers", None)
            if not headers:
                continue
            for k, v in headers.items():
                if type(v) in [bool, str, bytes, int, float]:
                    attrs[f"http.{req}.headers.{k}"] = v
        span.add_event(name="exception", attributes=attrs)

    @staticmethod
    def record_exception(
        e: Exception, attributes: typing.Optional[typing.Dict[str, any]] = None
    ) -> None:
        """
        Record arbitrary exceptions raised within your app.

        Example:
            import highlight_io
            H = highlight_io.H('project_id', ...)

            def my_fn():
                try:
                    for i in range(20):
                        result = 100 / (10 - i)
                        print(f'dangerous: {result}')
                except Exception as e:
                    H.record_exception(e)


        :param e: the exception to record. the contents and stacktrace will be recorded.
        :param attributes: additional metadata to attribute to this error.
        :return: None
        """
        span = otel_trace.get_current_span()
        if not span:
            raise RuntimeError("H.record_exception called without a span context")
        span.record_exception(e, attributes)

    @property
    def logging_handler(self) -> logging.Handler:
        """A logging handler implementing `logging.Handler` that allows plugging highlight_io
        into your existing logging setup.

        Example:
            import highlight_io
            from loguru import logger

            H = highlight_io.H('project_id', ...)

            logger.add(
                H.logging_handler,
                format="{message}",
                level="INFO",
                backtrace=True,
            )
        """
        return self._log_handler

    def log_hook(self, span: Span, record: logging.LogRecord, formatted: str = ""):
        if span and span.is_recording():
            ctx = span.get_span_context()
            session_id, request_id = H._instance.get_highlight_context(
                span.context.trace_id
            )
            # record.created is sec but timestamp should be ns
            ts = int(record.created * 1000.0 * 1000.0 * 1000.0)
            attributes = span.attributes.copy()
            attributes[SpanAttributes.CODE_FUNCTION] = record.funcName
            attributes[SpanAttributes.CODE_NAMESPACE] = record.module
            attributes[SpanAttributes.CODE_FILEPATH] = record.pathname
            attributes[SpanAttributes.CODE_LINENO] = record.lineno
            attributes["highlight.trace_id"] = request_id
            attributes["highlight.session_id"] = session_id
            if isinstance(record.args, dict):
                attributes.update(record.args)
            elif isinstance(record.args, list):
                attributes["args"] = record.args
            elif record.args:
                attributes["args"] = str(record.args)

            message = formatted or record.getMessage()
            try:
                # Handle loguru's serialize=True format
                # See: https://loguru.readthedocs.io/en/stable/api/logger.html#record
                obj = json.loads(message)
                extra = obj["record"]["extra"]
                message = obj["text"]

                for key, value in extra.items():
                    attributes[key] = value
            except:
                pass

            if record.exc_info:
                attributes["exception.detail"] = message
                return self.record_exception(record.exc_info[1], attributes=attributes)

            r = LogRecord(
                timestamp=ts,
                trace_id=ctx.trace_id,
                span_id=ctx.span_id,
                trace_flags=ctx.trace_flags,
                severity_text=record.levelname,
                severity_number=std_to_otel(record.levelno),
                body=message,
                resource=span.resource,
                attributes=attributes,
            )
            self.log.emit(r)

    def _instrument_logging(self):
        if H._logging_instrumented:
            return

        LoggingInstrumentor().instrument(
            set_logging_format=True, log_hook=self.log_hook
        )
        otel_factory = logging.getLogRecordFactory()

        def factory(*args, **kwargs) -> LogRecord:
            span = otel_trace.get_current_span()
            if span != INVALID_SPAN and span.is_recording():
                manager = contextlib.nullcontext(enter_result=span)
            else:
                manager = self.trace("highlight.log")

            try:
                with manager:
                    return otel_factory(*args, **kwargs)
            except RecursionError:
                # in case we are hitting a recursive log from the `self.trace()` invocation
                # (happens when we exceed the otel log queue depth)
                return otel_factory(*args, **kwargs)

        logging.setLogRecordFactory(factory)
        H._logging_instrumented = True

    def get_highlight_context(self, trace_id: str) -> typing.Tuple[str, str]:
        """
        Get the highlight context associated with a trace id.

        :param trace_id: the trace id to lookup
        :return: a tuple of (session_id, request_id)
        """
        return self._context_map.get(trace_id, ("", ""))

    @property
    def context(self) -> Context:
        """
        Get the opentelemetry context of the current trace.
        """
        return get_current()


def trace(func):
    def wrapper(*args, **kwargs):
        with H.get_instance().trace(span_name=func.__name__):
            return func(*args, **kwargs)

    return wrapper


def _build_resource(
    service_name: str,
    service_version: str,
    environment: str,
) -> Resource:
    attrs = {}

    if service_name:
        attrs[ResourceAttributes.SERVICE_NAME] = service_name
    if service_version:
        attrs[ResourceAttributes.SERVICE_VERSION] = service_version
    if environment:
        attrs[ResourceAttributes.DEPLOYMENT_ENVIRONMENT] = environment

    return Resource.create(attrs)
