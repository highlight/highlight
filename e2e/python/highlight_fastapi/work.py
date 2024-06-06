import hashlib
import sys

from celery import Celery
from loguru import logger

import highlight_io
from highlight_io.integrations.celery import CeleryIntegration

logger.configure(handlers=[{"sink": sys.stdout, "level": "INFO"}])

app = Celery(
    "work",
    broker="redis://localhost:6379/1",
    backend="redis://localhost:6379/1",
)


@app.task
def add(x, y):
    logger.info(f"Processing {x} and {y}")
    value = ""
    for i in range(x * y):
        logger.debug(f"Adding {i}")
        value = hashlib.sha512(f"{value}-{i}".encode()).hexdigest()
    logger.info(f"got {value}")
    return value


# poetry run celery -A work worker --loglevel=DEBUG
if __name__ == "__main__":
    H = highlight_io.H(
        "1",
        instrument_logging=False,
        integrations=[CeleryIntegration()],
        otlp_endpoint="http://localhost:4318",
        service_name="my-celery-worker",
        service_version="1.0.0",
        environment="e2e-test",
        debug=True,
        disable_export_error_logging=True,
    )
    logger.add(
        H.logging_handler,
        serialize=True,
        format="{message}",
        level="DEBUG",
        backtrace=True,
    )
    worker = app.Worker(include=["work"])
    worker.start()
