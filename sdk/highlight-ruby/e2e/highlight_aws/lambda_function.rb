# import logging
# import random
# from datetime import datetime

require '../highlight_io/sdk'

# from highlight_io.integrations.aws import observe_handler

# logger = logging.getLogger()
# logger.setLevel(logging.INFO)

H = highlight_io.H("1", record_logs=True)

@observe_handler
def lambda_handler(event, context):
    start = datetime.now()
    logger.info(f"Python AWS Lambda request {event}, {context}")
    logger.info(
        "Python AWS Lambda hello handler",
        {"customer": event.get("customer") or "unknown"},
    )

    if random.random() < 0.2:
        raise ValueError("oh no!")

    name = event.get("name") or "unknown"
    customer = event.get("customer") or "unknown"
    logger.info(
        "Python AWS Lambda got name",
        {
            "customer": customer,
            "name": name,
            "float": 1.2345,
            "duration": (datetime.now() - start).total_seconds(),
        },
    )

    return {
        "statusCode": 200,
        "body": f"Hello, {name}. This HTTP triggered function executed successfully.",
    }
