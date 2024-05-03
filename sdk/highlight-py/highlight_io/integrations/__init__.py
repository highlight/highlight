import abc
import logging
from typing import Collection

import opentelemetry.instrumentation.instrumentor
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor


class NoopInstrumentor(BaseInstrumentor):
    def _uninstrument(self, **kwargs):
        return

    def instrumentation_dependencies(self) -> Collection[str]:
        return []

    def instrument(self, **kwargs):
        pass

    def uninstrument(self, **kwargs):
        pass


class Integration(abc.ABC):
    INTEGRATION_KEY: str = ""

    def __init__(self):
        self.logger = logging.getLogger("highlight_io")

    def importer(self):
        try:
            instrumentor = self.instrumentor()
            # noinspection PyProtectedMember
            conflicts = instrumentor._check_dependency_conflicts()
            if conflicts:
                raise RuntimeError(conflicts)
            return instrumentor
        except (ImportError, ModuleNotFoundError, RuntimeError) as e:
            self.logger.debug(
                "Instrumentation %s not available: %s", self.INTEGRATION_KEY, e
            )
            return NoopInstrumentor()

    def instrumentor(
        self,
    ) -> opentelemetry.instrumentation.instrumentor.BaseInstrumentor:
        raise NotImplementedError()

    def enable(self):
        self.importer().instrument()

    def disable(self):
        self.importer().uninstrument()
