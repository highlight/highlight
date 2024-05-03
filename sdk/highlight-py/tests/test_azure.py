import logging
import random

import azure.functions as func
import pytest

from highlight_io import H
from highlight_io.integrations.azure import observe_handler


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request.")

    if random.random() < 0.2:
        raise ValueError("oh no!")

    return func.HttpResponse(
        f"Hello! This HTTP triggered function executed successfully."
    )


def test_azure(mocker):
    mocker.patch("random.random", return_value=0.1)
    mock_trace = mocker.spy(H, "trace")
    # Construct a mock HTTP request.
    req = func.HttpRequest(
        method="GET",
        body=None,
        url="/api/my_second_function",
        headers={H.REQUEST_HEADER: "a1b2c3/1234"},
        params={"value": "21"},
    )

    with pytest.raises(expected_exception=ValueError):
        main(req)

    mock_trace.assert_called_with(
        H.get_instance(), "observe_serverless", "a1b2c3", "1234"
    )
