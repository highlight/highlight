import logging
import random

import functions_framework
import pytest
from flask import Request

from highlight_io import H
from highlight_io.integrations.gcp import observe_handler


@observe_handler
@functions_framework.http
def hello_http(request):
    logging.info("Python HTTP trigger function processed a request.")

    if random.random() < 0.2:
        raise ValueError("oh no!")
    return "Hello!"


def test_gcp(mocker):
    H("1", instrument_logging=True)

    mocker.patch("random.random", return_value=0.1)
    mock_trace = mocker.spy(H, "trace")

    # Construct a mock HTTP request.
    request = Request(environ={"HTTP_X_HIGHLIGHT_REQUEST": "a1b2c3/1234"})

    with pytest.raises(expected_exception=ValueError):
        hello_http(request)

    mock_trace.assert_called_with(
        H.get_instance(), "observe_serverless", "a1b2c3", "1234"
    )
