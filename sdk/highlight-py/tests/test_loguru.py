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
