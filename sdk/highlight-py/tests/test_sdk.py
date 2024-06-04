import logging
import time

import pytest
from opentelemetry.sdk._logs._internal.export import BatchLogRecordProcessor
from opentelemetry.sdk.trace.export import BatchSpanProcessor

import highlight_io


@pytest.fixture(params=[None, [], ["Flask"]])
def integrations(mocker, request):
    if request.param:
        integrations = [mocker.MagicMock() for _ in request.param]
        yield integrations
        for integration in integrations:
            integration.enable.assert_called()
    else:
        yield request.param


@pytest.fixture(params=[None, False, True])
def mock_otlp(mocker, request, integrations):
    span = mocker.patch("highlight_io.sdk.OTLPSpanExporter")
    log = mocker.patch("highlight_io.sdk.OTLPLogExporter")
    mocker.patch(
        "highlight_io.sdk.BatchSpanProcessor", return_value=BatchSpanProcessor(span)
    )
    mocker.patch(
        "highlight_io.sdk.BatchLogRecordProcessor",
        return_value=BatchLogRecordProcessor(log),
    )
    yield integrations, request.param


@pytest.fixture()
def mock_trace(mocker):
    span = mocker.patch("highlight_io.sdk.OTLPSpanExporter")
    log = mocker.patch("highlight_io.sdk.OTLPLogExporter")
    sp = mocker.patch(
        "highlight_io.sdk.BatchSpanProcessor", return_value=BatchSpanProcessor(span)
    )
    lg = mocker.patch(
        "highlight_io.sdk.BatchLogRecordProcessor",
        return_value=BatchLogRecordProcessor(log),
    )
    mock_trace = mocker.spy(highlight_io.H, "trace")
    yield mock_trace


@pytest.mark.parametrize("project_id", [None, "", "a123"])
@pytest.mark.parametrize("session_id", ["", "a1b2c3d4e5"])
@pytest.mark.parametrize("request_id", ["", "a123"])
@pytest.mark.parametrize("environment", ["", "ci-test"])
def test_record_exception(
    mocker, mock_otlp, project_id, session_id, request_id, environment
):
    integrations, instrument_logging = mock_otlp
    h = highlight_io.H(
        project_id,
        integrations=integrations,
        instrument_logging=instrument_logging,
        environment=environment,
    )
    spy = mocker.spy(h.tracer, "start_as_current_span")

    for i in range(10):
        logging.info(f"hey there! {i}")
        with h.trace(session_id, request_id):
            logging.info(f"trace! {i}")
        h.record_exception(
            FileNotFoundError(f"test! {i}"), attributes={"hello": "there"}
        )

    assert len(spy.call_args_list) == 10


def test_log_no_trace(mock_trace):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    h = highlight_io.H("1", instrument_logging=True)
    logger.info(f"hey there!")
    h.flush()

    assert mock_trace.call_args_list[0].args[1:] == ("highlight.log",)


def test_test_decorator(mock_trace):
    h = highlight_io.H("1", instrument_logging=True)

    @highlight_io.trace
    def my_func():
        return "yo"

    my_func()
    h.flush()

    assert mock_trace.call_args_list[0].args[1:] == ("highlight.log",)


@pytest.mark.parametrize("debug", [False, True])
@pytest.mark.parametrize("disable_export_error_logging", [False, True])
def test_no_errors(mock_trace, debug, disable_export_error_logging):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    h = highlight_io.H(
        "1",
        debug=debug,
        disable_export_error_logging=disable_export_error_logging,
        otlp_endpoint="http://foo:4318",
    )
    logger.info(f"hey there!")
    h.flush()

    assert mock_trace.call_args_list[0].args[1:] == ("highlight.log",)
