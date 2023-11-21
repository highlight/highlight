import logging
from unittest.mock import MagicMock

import pytest
from loguru import logger

import highlight_io

H = highlight_io.H("1", instrument_logging=False)


def test_loguru(mocker):
    mock = mocker.patch.object(H, "log")

    logger.add(
        H.logging_handler,
        format="{message}",
        level="INFO",
        backtrace=True,
    )

    logger.info("welcome to this test test_loguru", {"hello": "world", "vadim": 12.34})
    mock.emit.assert_called()


def test_loguru_session_request(mocker):
    mock = mocker.patch.object(H, "log")

    logger.add(
        H.logging_handler,
        format="{message}",
        level="INFO",
        backtrace=True,
    )

    with H.trace(session_id="abc123", request_id="a1b2c3"):
        logger.info(
            "welcome to this test test_loguru_session_request",
            {"hello": "world", "vadim": 12.34},
        )
        mock.emit.assert_called()


@pytest.mark.parametrize("exc", [None, ZeroDivisionError("bad")])
def test_log_hook(mocker, exc):
    mock_log = mocker.patch.object(H, "log")
    mock_record_exception = mocker.patch.object(H, "record_exception")

    span = MagicMock()
    span.attributes = {"session_id": "abc123", "request_id": "a1b2c3"}
    record = logging.LogRecord(
        args={},
        exc_info=(type(exc), exc, exc.__traceback__) if exc else None,
        level=logging.INFO,
        lineno=1,
        msg="i love msg",
        name="name",
        pathname="pathname",
    )

    H.log_hook(span, record)

    if exc:
        mock_record_exception.assert_called()
        assert (
            mock_record_exception.call_args_list[0][1]["attributes"]["exception.detail"]
            == "i love msg"
        )
        mock_log.emit.assert_not_called()
    else:
        mock_record_exception.assert_not_called()
        mock_log.emit.assert_called()
