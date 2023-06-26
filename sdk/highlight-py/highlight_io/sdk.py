import contextlib
import logging
import typing

from opentelemetry import trace, _logs
from opentelemetry._logs.severity import std_to_otel
from opentelemetry.exporter.otlp.proto.http import Compression
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk._logs import LoggerProvider, LogRecord
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.trace import TracerProvider, Span
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.trace import INVALID_SPAN

from highlight_io.integrations import Integration


class LogHandler(logging.Handler):
    def __init__(self, highlight: "H", level=logging.NOTSET):
        self.highlight = highlight
        super(LogHandler, self).__init__(level=level)

    def emit(self, record: logging.LogRecord):
        ctx = contextlib.nullcontext
        span = trace.get_current_span()
        if span is None or not span.is_recording():
            ctx = self.highlight.trace

        with ctx():
            self.highlight.log_hook(trace.get_current_span(), record)


class H(object):
    REQUEST_HEADER = "X-Highlight-Request"
    OTLP_HTTP = "https://otel.highlight.io:4318"
    _instance: "H" = None
    _logging_instrumented = False

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
        otlp_endpoint: str = "",
        instrument_logging: bool = True,
        log_level=logging.DEBUG,
    ):
        """
        Setup Highlight backend instrumentation.

        Example:
            import highlight_io
            H = highlight_io.H('project_id', ...)


        :param project_id: a string that corresponds to the verbose id of your project from app.highlight.io/setup
        :param integrations: a list of Integrations that allow connecting with your framework, like Flask or Django.
        :param instrument_logging: defaults to True. set False to disable auto-instrumentation of python `logging` methods.
        :param otlp_endpoint: set to a custom otlp destination
        :return: a configured H instance
        """
        H._instance = self
        self._project_id = project_id
        self._integrations = integrations or []
        self._otlp_endpoint = otlp_endpoint or H.OTLP_HTTP
        self._log_handler = LogHandler(self, level=log_level)
        if instrument_logging:
            self._instrument_logging()

        self._trace_provider = TracerProvider()
        self._trace_provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(
                    f"{self._otlp_endpoint}/v1/traces", compression=Compression.Gzip
                ),
                schedule_delay_millis=1000,
                export_timeout_millis=5000,
            )
        )
        trace.set_tracer_provider(self._trace_provider)
        self.tracer = trace.get_tracer(__name__)

        self._log_provider = LoggerProvider()
        self._log_provider.add_log_record_processor(
            BatchLogRecordProcessor(
                OTLPLogExporter(
                    f"{self._otlp_endpoint}/v1/logs", compression=Compression.Gzip
                ),
                schedule_delay_millis=1000,
                export_timeout_millis=5000,
            )
        )
        _logs.set_logger_provider(self._log_provider)
        self.log = self._log_provider.get_logger(__name__)

        for integration in self._integrations:
            integration.enable()

    def flush(self):
        self._trace_provider.force_flush()
        self._log_provider.force_flush()

    @contextlib.contextmanager
    def trace(
        self,
        session_id: typing.Optional[str] = "",
        request_id: typing.Optional[str] = "",
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
        :return: Span
        """
        # in case the otel library is in a non-recording context, do nothing
        if not hasattr(self, "tracer") or not self.tracer:
            yield
            return

        with self.tracer.start_as_current_span("highlight-ctx") as span:
            span.set_attributes({"highlight.project_id": self._project_id})
            span.set_attributes({"highlight.session_id": session_id})
            span.set_attributes({"highlight.trace_id": request_id})
            try:
                yield span
            except Exception as e:
                self.record_exception(e)
                raise

    @staticmethod
    def record_exception(e: Exception) -> None:
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
        :return: None
        """
        span = trace.get_current_span()
        if not span:
            raise RuntimeError("H.record_exception called without a span context")
        span.record_exception(e)
        logging.exception("Highlight caught an error", exc_info=e)

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

    def log_hook(self, span: Span, record: logging.LogRecord):
        if span and span.is_recording():
            ctx = span.get_span_context()
            # record.created is sec but timestamp should be ns
            ts = int(record.created * 1000.0 * 1000.0 * 1000.0)
            attributes = span.attributes.copy()
            attributes["code.function"] = record.funcName
            attributes["code.namespace"] = record.module
            attributes["code.filepath"] = record.pathname
            attributes["code.lineno"] = record.lineno
            attributes.update(record.args or {})
            r = LogRecord(
                timestamp=ts,
                trace_id=ctx.trace_id,
                span_id=ctx.span_id,
                trace_flags=ctx.trace_flags,
                severity_text=record.levelname,
                severity_number=std_to_otel(record.levelno),
                body=record.getMessage(),
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
            span = trace.get_current_span()
            if span != INVALID_SPAN:
                manager = contextlib.nullcontext(enter_result=span)
            else:
                manager = self.trace()

            try:
                with manager:
                    return otel_factory(*args, **kwargs)
            except RecursionError:
                # in case we are hitting a recusrive log from the `self.trace()` invocation
                # (happens when we exceed the otel log queue depth)
                return otel_factory(*args, **kwargs)

        logging.setLogRecordFactory(factory)
        H._logging_instrumented = True
