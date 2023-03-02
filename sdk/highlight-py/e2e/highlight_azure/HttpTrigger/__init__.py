import logging
import random
from datetime import datetime

import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

H = highlight_io.H("1", record_logs=True)


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    start = datetime.now()
    logging.info("Python HTTP trigger function processed a request.")
    logging.info(
        "Python Azure hello handler",
        {"customer": req.headers.get("customer") or "unknown"},
    )

    if random.random() < 0.2:
        raise ValueError("oh no!")

    name = req.params.get("name")
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get("name")

    logging.info(
        "Python Azure got name",
        {
            "customer": req.headers.get("customer") or "unknown",
            "name": name,
            "float": 1.2345,
            "duration": datetime.now() - start,
        },
    )

    if name:
        return func.HttpResponse(
            f"Hello, {name}. This HTTP triggered function executed successfully."
        )
    else:
        return func.HttpResponse(
            "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
            status_code=200,
        )
