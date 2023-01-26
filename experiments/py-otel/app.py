import contextlib
import logging
import random
import sys
import time
from flask import Flask

app = Flask(__name__)

from opentelemetry import trace, _logs
from opentelemetry._logs.severity import std_to_otel
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk._logs import LoggerProvider, LogRecord
from opentelemetry.sdk._logs.export import SimpleLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider, _Span
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.error_handler import GlobalErrorHandler, ErrorHandler

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

log_provider = LoggerProvider()
log_provider.add_log_record_processor(SimpleLogRecordProcessor(OTLPLogExporter()))
_logs.set_logger_provider(log_provider)
log = log_provider.get_logger(__name__)


@contextlib.contextmanager
def highlight_error_handler(span: _Span):
    try:
        yield
    except Exception:
        e = sys.exc_info()
        span.record_exception(e, {"foo": "bar"})
        # TODO(vkorolik) make sure stack trace reports original exc
        logging.exception("Highlight caught an error", exc_info=e)


def log_hook(span: _Span, record: logging.LogRecord):
    if span and span.is_recording():
        record.custom_user_attribute_from_log_hook = "some-value"
    ctx = span.get_span_context()
    r = LogRecord(
        timestamp=int(record.created),
        trace_id=ctx.trace_id,
        span_id=ctx.span_id,
        trace_flags=ctx.trace_flags,
        severity_text=record.levelname,
        severity_number=std_to_otel(record.levelno),
        body=record.getMessage(),
        resource=Resource({}),
    )
    log.emit(r)


LoggingInstrumentor().instrument(set_logging_format=True, log_hook=log_hook)


@app.route('/')
def hello():
    with tracer.start_as_current_span("parent") as span:
        with highlight_error_handler(span):
            for idx in range(1000):
                with tracer.start_as_current_span("child"):
                    logging.info(f"hello {idx}")
                    time.sleep(0.001)
                    if random.randint(0, 10) == 1:
                        raise Exception(f'random error! {idx}')
            logging.warning("hi")
    return '<h1>Hello, World!</h1>'
