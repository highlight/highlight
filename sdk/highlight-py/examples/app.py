import logging
import random
import time

from flask import Flask

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

app = Flask(__name__)
H = highlight_io.H(
    "1",
    integrations=[FlaskIntegration()],
    record_logs=True,
    otlp_endpoint="http://localhost:4318",
)


@app.route("/")
def hello():
    for idx in range(1000):
        logging.info(f"hello {idx}")
        time.sleep(0.001)
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
    logging.warning("made it outside the loop!")
    return "<h1>Hello, World!</h1>"


if __name__ == "__main__":
    app.run(port=8085)
