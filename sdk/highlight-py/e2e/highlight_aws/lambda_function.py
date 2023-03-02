import logging
import random
from datetime import datetime

import highlight_io
from highlight_io.integrations.aws import observe_handler

H = highlight_io.H("1", record_logs=True)


@observe_handler
def lambda_handler(event, context):
    start = datetime.now()
    logging.info("Python HTTP trigger function processed a request.")
    logging.info(
        "Python AWS Lambda hello handler",
        {"customer": event.get("customer") or "unknown"},
    )

    if random.random() < 0.2:
        raise ValueError("oh no!")

    name = event.get("name")

    logging.info(
        "Python AWS Lambda got name",
        {
            "customer": event.get("customer") or "unknown",
            "name": name,
            "float": 1.2345,
            "duration": datetime.now() - start,
        },
    )

    return {
        "statusCode": 200,
        "body": f"Hello, {name}. This HTTP triggered function executed successfully.",
    }
