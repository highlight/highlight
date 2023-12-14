import pytest
import requests
from unittest.mock import ANY

from highlight_io.integrations.requests import RequestsIntegration
from highlight_io.utils import utils
from highlight_io import H

# an invalid url that should be safe to make a request
request_url = "http://localhost:80/endpoint"


@pytest.fixture(autouse=True)
def cleanup_integration():
    yield
    integration = RequestsIntegration()
    integration.disable()


@pytest.fixture()
def integration_mocks(mocker):
    mock_init = mocker.spy(RequestsIntegration, "__init__")
    mock_hook = mocker.spy(utils, "trace_origin_url")

    return mock_init, mock_hook


def send_request():
    try:
        requests.get(request_url)
    except requests.RequestException:
        pass


def test_default_integration(integration_mocks):
    mock_init, mock_hook = integration_mocks

    H(project_id="1")
    send_request()

    mock_init.assert_called_with(ANY)
    mock_hook.assert_called_with(False, request_url)


def test_requests_integration_disabled(integration_mocks):
    mock_init, mock_hook = integration_mocks

    H(project_id="1", disabled_integrations=["requests"])
    send_request()

    mock_init.assert_not_called()
    mock_hook.assert_not_called()


def test_custom_requests_integration(integration_mocks):
    mock_init, mock_hook = integration_mocks

    H(
        project_id="1",
        integrations=[
            RequestsIntegration(tracing_origins=["localhost", "highlight.io"])
        ],
    )
    send_request()

    mock_init.assert_called_with(ANY, tracing_origins=["localhost", "highlight.io"])
    mock_hook.assert_called_with(["localhost", "highlight.io"], request_url)
