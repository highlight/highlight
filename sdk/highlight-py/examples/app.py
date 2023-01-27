import logging
import random
import time

from flask import Flask, request

from highlight_io.highlight import highlight_error_handler, instrument_logs

app = Flask(__name__)
instrument_logs()


@app.route('/')
def hello():
    with highlight_error_handler(request.headers):
        for idx in range(1000):
            logging.info(f"hello {idx}")
            time.sleep(0.001)
            if random.randint(0, 10) == 1:
                raise Exception(f'random error! {idx}')
        logging.warning("hi")
    return '<h1>Hello, World!</h1>'
