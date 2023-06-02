import highlight_io

from loguru import logger


def test_loguru():
    h = highlight_io.H(project_id, integrations=integrations, record_logs=False)

    logger.add(
        H.logging_handler,
        format="{message}",
        level="INFO",
        backtrace=True,
    )

    logger.info("welcome to this test", {"hello": "world", "vadim": 12.34})

    assert False
