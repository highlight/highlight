import pytest

from e2e.highlight_aws.lambda_function import lambda_handler
from highlight_io import H


def test_aws(mocker):
    mocker.patch("random.random", return_value=0.1)
    mock_trace = mocker.patch("highlight_io.H.trace")
    # Construct a mock HTTP request.
    req = {
        H.REQUEST_HEADER: "a1b2c3/1234",
    }

    with pytest.raises(expected_exception=ValueError):
        lambda_handler(req, None)

    mock_trace.assert_called_with("a1b2c3", "1234")
