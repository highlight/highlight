import logging
import random
import sys
import time
import traceback

import highlight_io
from loguru import logger

H = highlight_io.H(
    "1",
    instrument_logging=False,
    service_name="my-loguru-app",
    service_version="1.0.0",
    otlp_endpoint="http://localhost:4318",
    environment="e2e-test",
)

logger.add(
    H.logging_handler,
    format="{message} {extra}",
    level="INFO",
    backtrace=True,
    serialize=True,
)


def main():
    logger.info("hello handler", customer_id="99")
    for idx in range(1):
        with H.trace(session_id="session-abc123", request_id="request-abc123"):
            logger.info(f"hello from loguru with trace {idx}")
            logging.info(f"hello from logging with trace {idx}")

    try:
        get_greeting()
    except Exception:
        pass

    logger.warning("made it outside the loop!")
    try:
        raise ZeroDivisionError("oh no")
    except ZeroDivisionError:
        logger.error("oops", exc_info=sys.exc_info())


@logger.catch(reraise=True)
def get_greeting():
    logger.info("calling handler")
    raise Exception("THIS ERROR WAS RAISED ON PURPOSE")


if __name__ == "__main__":
    main()
    H.flush()
