import azure.functions as func
import pytest

from examples.HighlightAzureExample.function_app import main
from highlight_io import H


def test_azure(mocker):
    mock_trace = mocker.patch("highlight_io.H.trace")
    # Construct a mock HTTP request.
    req = func.HttpRequest(
        method="GET",
        body=None,
        url="/api/my_second_function",
        headers={H.REQUEST_HEADER: "a1b2c3/1234"},
        params={"value": "21"},
    )

    # Call the function.
    func_call = main.build().get_user_function()
    with pytest.raises(expected_exception=ValueError):
        func_call(req)

    mock_trace.assert_called_with("a1b2c3", "1234")
