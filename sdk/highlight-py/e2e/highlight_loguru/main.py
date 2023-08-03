import logging
import random
import time

import highlight_io
from loguru import logger

H = highlight_io.H(
    "1",
    instrument_logging=False,
    service_name="my-app",
    service_version="1.0.0",
)

logger.add(
    H.logging_handler,
    format="{message}",
    level="INFO",
    backtrace=True,
)


def main():
    logger.info("hello handler", {"customer": "unknown"})
    for idx in range(1000):
        with H.trace(session_id="session-abc123", request_id="request-abc123"):
            logger.info(f"hello from loguru with trace {idx}")
            logging.info(f"hello from logging with trace {idx}")
    logger.warning("made it outside the loop!")
    logger.error("oops")


if __name__ == "__main__":
    main()
