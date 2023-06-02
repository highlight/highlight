import logging
import random
import time

import highlight_io
from loguru import logger

H = highlight_io.H("1", record_logs=False)

logger.add(
    H.logging_handler,
    format="{message}",
    level="INFO",
    backtrace=True,
)


def main():
    logger.info("hello handler", {"customer": "unknown"})
    for idx in range(1000):
        logger.info(f"hello {idx}")
    logger.warning("made it outside the loop!")
    logger.error("oops")


if __name__ == "__main__":
    main()
