import multiprocessing
import threading
from typing import Callable

from opentelemetry import context
from opentelemetry.propagate import inject, extract

import highlight_io

H = highlight_io.H("1", instrument_logging=True, otlp_endpoint="http://localhost:4318")


class Worker(threading.Thread):
    def run(self) -> list[str]:
        with H.trace(span_name="thread-child"):
            return ['yo']


def propagate_otel_context_process(carrier: dict, fn: Callable):
    ctx = extract(carrier)
    token = context.attach(ctx)
    try:
        fn()
    finally:
        context.detach(token)


def any_function():
    with H.trace(span_name="process-child") as span:
        value = Worker().run()[0]
        span.set_attribute("value", value)
        print(f"Value: {value}")
        print("Done with process")


def main():
    with H.trace("process-parent") as parent_span:
        carrier = {}
        inject(carrier)

        p = multiprocessing.Process(
            target=propagate_otel_context_process,
            args=(carrier, any_function),
        )
        p.start()
        # p.join()
        print("Done with parent")


if __name__ == "__main__":
    main()
    H.flush()
