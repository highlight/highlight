import logging

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


@pytest.mark.parametrize("project_id", [None, "", "a123"])
@pytest.mark.parametrize("session_id", ["", "a1b2c3d4e5"])
@pytest.mark.parametrize("request_id", ["", "a123"])
def test_record_exception(mock_otlp, project_id, session_id, request_id):
    integrations, instrument_logging = mock_otlp
    h = highlight_io.H(
        project_id, integrations=integrations, instrument_logging=instrument_logging
    )

    for i in range(10):
        logging.info(f"hey there! {i}")
        with h.trace(session_id, request_id):
            logging.info(f"trace! {i}")
        h.record_exception(FileNotFoundError(f"test! {i}"))


def test_log_no_trace(mocker):
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

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    h = highlight_io.H("1", instrument_logging=True)
    logger.info(f"hey there!")
    h.flush()

    assert mock_trace.call_args_list[0].args[1:] == ()
