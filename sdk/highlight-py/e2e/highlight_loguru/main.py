import logging
import random
import time

import highlight_io
from loguru import logger

H = highlight_io.H(
    "1",
    instrument_logging=False,
    service_name="my-loguru-app",
    service_version="1.0.0",
    otlp_endpoint="http://localhost:4318",
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
    logger.warning("made it outside the loop!")
    logger.error("oops")


if __name__ == "__main__":
    main()
