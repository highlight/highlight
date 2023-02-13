import logging
import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

app = func.FunctionApp()

H = highlight_io.H("TODO-PROJECT-ID", record_logs=True)


@app.function_name(name="hello_world")
@app.route(route="hello")
@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(f"hello there!")
    x = 2
    if x + 2 == 4:
        raise ValueError("huh?")
    return func.HttpResponse(body="hello, world")
