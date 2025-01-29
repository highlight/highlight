"""
Run via gunicorn
$ gunicorn main_2:app --workers=1 --worker-class=uvicorn.workers.UvicornWorker --preload --access-logfile=- --bind=0.0.0.0:8000 --timeout=1200 --logger-class=logger.GunicornLogger
"""

import logging
import os
from dataclasses import dataclass
from typing import Any

import sys
from gunicorn.config import Config  # type: ignore
from gunicorn.glogging import Logger  # type: ignore
from loguru import logger

import highlight_io  # type: ignore

LOGGER_FORMAT: str = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <7}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level> <level>{extra}</level>"
)


@dataclass
class Settings:
    LOG_LEVEL: int
    HIGHLIGHT_PROJECT_ID: str
    ENVIRONMENT: str
    JSON_LOGS_ENABLED: bool


settings = Settings(logging.INFO, "1", "test", True)


# Useful for filtering out logs from specific endpoints like a health check endpoint.
class EndpointFilter(logging.Filter):
    def __init__(
            self,
            path: str,
            *args: Any,
            **kwargs: Any,
    ):
        super().__init__(*args, **kwargs)
        self._path = path

    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find(self._path) == -1


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        # get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = str(record.levelno)

        # find caller from where originated the logged message
        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            next_frame = frame.f_back
            if next_frame is None:
                break
            frame = next_frame
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


class GunicornLogger(Logger):  # type: ignore
    def setup(self, cfg: Config) -> None:
        handler = InterceptHandler()

        # Add log handler to logger and set log level
        self.error_log.addHandler(handler)
        self.error_log.setLevel(settings.LOG_LEVEL)
        self.access_log.addHandler(handler)
        self.access_log.setLevel(settings.LOG_LEVEL)

        # Configure logger before gunicorn starts logging
        logger.configure(
            handlers=[
                {
                    "sink": sys.stdout,
                    "level": settings.LOG_LEVEL,
                    "format": LOGGER_FORMAT,
                }
            ]
        )


def configure_logger() -> None:
    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(settings.LOG_LEVEL)
    logging.getLogger("uvicorn.access").addFilter(EndpointFilter(path="/health"))

    # Remove all log handlers and propagate to root logger
    for name in logging.root.manager.loggerDict.keys():
        # Do not remove gunicorn loggers
        if "gunicorn" not in name:
            logging.getLogger(name).handlers = []
            logging.getLogger(name).propagate = True

    # Configure sqlalchemy engine logger, which by default is set to WARNING level
    logging.getLogger("sqlalchemy.engine").setLevel(settings.LOG_LEVEL)

    # Configure logger (again) if gunicorn is not used
    logger.configure(
        handlers=[
            {"sink": sys.stdout, "level": settings.LOG_LEVEL, "format": LOGGER_FORMAT}
        ]
    )

    if settings.HIGHLIGHT_PROJECT_ID:
        H = highlight_io.H(
            settings.HIGHLIGHT_PROJECT_ID,
            instrument_logging=False,
            environment=settings.ENVIRONMENT,
            disable_export_error_logging=True,
        )
        logger.add(
            H.logging_handler,
            serialize=settings.JSON_LOGS_ENABLED,
            format="{message}",
            level=settings.LOG_LEVEL,
            backtrace=True,
        )
