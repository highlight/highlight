import logging
import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

app = func.FunctionApp()

H = highlight_io.H("TODO-PROJECT-ID", record_logs=True)


@observe_handler
@app.function_name(name="BlobInput1")
@app.route(route="file")
@app.blob_input(
    arg_name="inputblob",
    path="sample-workitems/{name}",
    connection="AzureWebJobsStorage",
)
def receive_blob(req: func.HttpRequest, inputblob: bytes) -> func.HttpResponse:
    logging.info(f"Python Queue trigger function processed {len(inputblob)} bytes")
    return func.HttpResponse(body=inputblob)
