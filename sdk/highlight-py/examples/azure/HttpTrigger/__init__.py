import logging

import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

H = highlight_io.H("TODO-PROJECT-ID", record_logs=True)


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request.")

    x = 2
    if x + 2 == 4:
        raise ValueError("oh no!")

    name = req.params.get("name")
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get("name")

    if name:
        return func.HttpResponse(
            f"Hello, {name}. This HTTP triggered function executed successfully."
        )
    else:
        return func.HttpResponse(
            "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
            status_code=200,
        )
