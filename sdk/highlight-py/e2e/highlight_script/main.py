import logging
import random
import time

import highlight_io

H = highlight_io.H("1", instrument_logging=True, otlp_endpoint="http://localhost:4318")


def main():
    logging.info("hello main", {"customer": "world", "trace": "outside"})
    with H.trace():
        logging.info("hello handler", {"customer": "unknown"})
        for idx in range(1000):
            logging.info(f"hello {idx}")
            time.sleep(0.001)
            if random.randint(0, 100) == 1:
                raise Exception(f"random error! {idx}")
        logging.warning("made it outside the loop!")


if __name__ == "__main__":
    main()
    H.flush()
