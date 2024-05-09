import logging
import random

import pytest

from highlight_io import H
from highlight_io.integrations.aws import observe_handler

logger = logging.getLogger()
logger.setLevel(logging.INFO)


@observe_handler
def lambda_handler(event, context):
    logger.info(f"Python AWS Lambda request {event}, {context}")

    if random.random() < 0.2:
        raise ValueError("oh no!")

    return {
        "statusCode": 200,
        "body": f"Hello! This HTTP triggered function executed successfully.",
    }


def test_aws(mocker):
    mocker.patch("random.random", return_value=0.1)
    mock_trace = mocker.spy(H, "trace")
    # Construct a mock HTTP request.
    req = {
        H.REQUEST_HEADER: "a1b2c3/1234",
    }

    with pytest.raises(expected_exception=ValueError):
        lambda_handler(req, None)

    mock_trace.assert_called_with(
        H.get_instance(), "observe_serverless", "a1b2c3", "1234"
    )
