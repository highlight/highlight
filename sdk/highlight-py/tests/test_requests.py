import requests
from unittest.mock import ANY

from highlight_io.integrations.requests import RequestsIntegration
from highlight_io.utils import utils
from highlight_io import H

# an invalid url that should be safe to make a request
request_url = "http://localhost:80/endpoint"


def setup_mocks(mocker):
    mock_init = mocker.spy(RequestsIntegration, "__init__")
    mock_hook = mocker.spy(utils, "trace_origin_url")

    return mock_init, mock_hook


def send_request():
    try:
        requests.get(request_url)
    except requests.RequestException:
        pass


def cleanup():
    integration = RequestsIntegration()
    integration.enable()
    integration.disable()


def test_default_integration(mocker):
    mock_init, mock_hook = setup_mocks(mocker)

    H(project_id="1")
    send_request()

    mock_init.assert_called_with(ANY)
    mock_hook.assert_called_with(False, request_url)

    cleanup()


def test_requests_integration_disabled(mocker):
    mock_init, mock_hook = setup_mocks(mocker)

    H(project_id="1", disabled_integrations=["requests"])
    send_request()

    mock_init.assert_not_called()
    mock_hook.assert_not_called()

    cleanup()


def test_custom_requests_integration(mocker):
    mock_init, mock_hook = setup_mocks(mocker)

    H(
        project_id="1",
        integrations=[
            RequestsIntegration(tracing_origins=["localhost", "highlight.io"])
        ],
    )
    send_request()

    mock_init.assert_called_with(ANY, tracing_origins=["localhost", "highlight.io"])
    mock_hook.assert_called_with(["localhost", "highlight.io"], request_url)

    cleanup()
