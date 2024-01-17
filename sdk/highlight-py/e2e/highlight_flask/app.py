import logging
import random
import time
import requests

from flask import Flask, request

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration
from highlight_io.integrations.requests import RequestsIntegration

app = Flask(__name__)
H = highlight_io.H(
    "1",
    integrations=[FlaskIntegration()],
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="my-flask-app",
    service_version="1.0.0",
    environment="e2e-test",
)


@app.route("/")
def hello():
    logging.info(
        "Making an external request with requests",
        {"customer": request.headers.get("customer") or "unknown"},
    )

    for idx in range(1000):
        logging.info(f"hello {idx}")
        time.sleep(0.001)
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
    logging.warning("made it outside the loop!")
    return "<h1>Hello, World!</h1>"


@app.route("/external")
def external():
    r = requests.get(url="http://app.highlight.io/health_check")
    logging.info(f"received {r.status_code} response")

    return "<h1>External Request</h1>"


if __name__ == "__main__":
    app.run(port=8085)
