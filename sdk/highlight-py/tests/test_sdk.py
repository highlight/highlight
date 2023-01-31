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
def test_foo(mock_otlp, project_id, session_id, request_id):
    integrations, record_logs = mock_otlp
    h = highlight_io.H(project_id, integrations=integrations, record_logs=record_logs)

    for i in range(10):
        with h.trace(session_id, request_id):
            logging.info(f"trace! {i}")
        h.record_exception(FileNotFoundError(f"test! {i}"))
