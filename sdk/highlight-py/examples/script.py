import logging
import random
import time

import highlight_io

H = highlight_io.H("TODO-PROJECT-ID", record_logs=True)


def main():
    with H.trace():
        for idx in range(1000):
            logging.info(f"hello {idx}")
            time.sleep(0.001)
            if random.randint(0, 100) == 1:
                raise Exception(f"random error! {idx}")
        logging.warning("made it outside the loop!")


if __name__ == "__main__":
    main()
