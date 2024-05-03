import abc
import logging
from typing import Collection

from opentelemetry.instrumentation.instrumentor import BaseInstrumentor


class NoopInstrumentor(BaseInstrumentor):
    def _uninstrument(self, **kwargs):
        return

    def instrumentation_dependencies(self) -> Collection[str]:
        return []


class Integration(abc.ABC):
    INTEGRATION_KEY: str = ''

    def __init__(self):
        self.logger = logging.getLogger("highlight_io")

    def importer(self):
        try:
            return self.instrumentor()
        except (ImportError, ModuleNotFoundError) as e:
            self.logger.warning("Instrumentation %s not available: %s", self.INTEGRATION_KEY, e)
            return NoopInstrumentor()

    def instrumentor(self):
        raise NotImplementedError()

    def enable(self):
        self.importer().instrument()

    def disable(self):
        self.importer().uninstrument()
