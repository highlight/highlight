import logging
import random
from datetime import datetime

import functions_framework

import highlight_io
from highlight_io.integrations.gcp import observe_handler

H = highlight_io.H("1", instrument_logging=True)


@observe_handler
@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    request_json = request.get_json(silent=True)
    request_args = request.args

    start = datetime.now()
    logging.info("Python HTTP trigger function processed a request.")
    logging.info(
        "Python Google Cloud Functions hello handler",
        {"customer": request_args.get("customer") or "unknown"},
    )

    if random.random() < 0.2:
        raise ValueError("oh no!")

    if request_json and "name" in request_json:
        name = request_json["name"]
    elif request_args and "name" in request_args:
        name = request_args["name"]
    else:
        name = "World"

    logging.info(
        "Python Google Cloud Functions got name",
        {
            "customer": request_args.get("customer") or "unknown",
            "name": name,
            "float": 1.2345,
            "duration": datetime.now() - start,
        },
    )
    return "Hello {}!".format(name)
