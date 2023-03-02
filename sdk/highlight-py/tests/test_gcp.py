import pytest
from flask import Request

from e2e.highlight_gcp.hello_http import hello_http


def test_gcp(mocker):
    mocker.patch("random.random", return_value=0.1)
    mock_trace = mocker.patch("highlight_io.H.trace")
    # Construct a mock HTTP request.
    request = Request(environ={"HTTP_X_HIGHLIGHT_REQUEST": "a1b2c3/1234"})

    with pytest.raises(expected_exception=ValueError):
        hello_http(request)

    mock_trace.assert_called_with("a1b2c3", "1234")
