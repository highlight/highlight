import contextlib
from contextlib import nullcontext

from fastapi import Request, Response, HTTPException

import pytest
from opentelemetry.trace import Span, SpanContext
from starlette.datastructures import Headers
from starlette.responses import StreamingResponse

from highlight_io import H
from highlight_io.integrations.fastapi import FastAPIMiddleware


@pytest.fixture(params=[False, True])
def highlight_setup(request):
    H._instance = None
    try:
        if request.param:
            yield H(
                project_id="1",
                instrument_logging=True,
                integrations=[],
                otlp_endpoint="http://localhost:4318",
            )
        else:
            yield
    finally:
        H._instance = None


@pytest.mark.parametrize("exception", [False, True])
@pytest.mark.parametrize(
    "response",
    [
        Response(headers=Headers({"hey": "there"})),
        Response(status_code=404, content="foo", headers=Headers({"hey": "there"})),
        StreamingResponse(
            status_code=404,
            headers=Headers({"hey": "there"}),
            content=(f"foo-{i}" for i in range(10)),
        ),
    ],
)
@pytest.mark.asyncio
async def test_fastapi(mocker, highlight_setup, exception, response):
    mock_trace = mocker.patch("highlight_io.sdk.trace.get_current_span", autospec=Span)
    mock_trace.return_value.get_span_context.return_value = SpanContext(123, 456, False)
    app = mocker.MagicMock()
    middleware = FastAPIMiddleware(app)
    request = mocker.MagicMock(autospec=Request)
    request.headers = Headers({"hello": "world"})
    request.url = "https://localhost:8080/api/foo"

    async def body():
        yield "foo"

    request.body = body

    async def call_next(_: Request) -> Response:
        if exception:
            raise ValueError()
        return response

    ctx = nullcontext()
    if not highlight_setup:
        ctx = pytest.raises(NotImplementedError)
    elif exception:
        ctx = pytest.raises(ValueError)

    with ctx:
        await middleware.dispatch(request, call_next)

    if highlight_setup and response.status_code >= 400 and not exception:
        mock_trace.return_value.add_event.assert_called()
        expected = {
            "exception.type",
            "exception.message",
            "exception.stacktrace",
            "http.status_code",
            "http.request.headers.hello",
            "http.response.headers.hey",
            "http.response.headers.content-length",
            "http.response.detail",
            "http.method",
            "http.url",
        }
        if isinstance(response, StreamingResponse):
            expected.remove("http.response.headers.content-length")
        assert (
            set(
                mock_trace.return_value.add_event.call_args_list[0][1][
                    "attributes"
                ].keys()
            )
            == expected
        )
        assert (
            mock_trace.return_value.add_event.call_args_list[0][1]["attributes"][
                "http.url"
            ]
            == request.url
        )
    else:
        mock_trace.return_value.add_event.assert_not_called()
