import threading
import time
from typing import Callable

import highlight_io
from opentelemetry.context import Context

H = highlight_io.H("1", instrument_logging=True, otlp_endpoint="http://localhost:4318")


def propagate_otel_context_thread(ctx: Context, fn: Callable):
    with H.trace(span_name="Start thread", context=ctx):
        fn()


def any_function():
    with H.trace(span_name="thread-child"):
        time.sleep(1)


def main():
    with H.trace("thread-parent"):
        t = threading.Thread(
            target=propagate_otel_context_thread,
            args=(H.context, lambda: any_function()),
        )
        t.start()
        t.join()


if __name__ == "__main__":
    main()
    H.flush()
