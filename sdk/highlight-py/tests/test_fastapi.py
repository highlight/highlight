from contextlib import nullcontext

from fastapi import Request, Response

import pytest

from highlight_io import H
from highlight_io.integrations.fastapi import FastAPIMiddleware


@pytest.fixture(params=[False, True])
def highlight_setup(request):
    if request.param:
        yield H(project_id='1', record_logs=True, integrations=[], otlp_endpoint="http://localhost:4318")
    else:
        yield


@pytest.mark.parametrize('exception', [False, True])
@pytest.mark.asyncio
async def test_flask(mocker, highlight_setup, exception):
    app = mocker.MagicMock()
    middleware = FastAPIMiddleware(app)
    request = mocker.MagicMock()

    async def call_next(_: Request) -> Response:
        if exception:
            raise ValueError()
        return Response()

    ctx = nullcontext()
    if not highlight_setup:
        ctx = pytest.raises(NotImplementedError)
    elif exception:
        ctx = pytest.raises(ValueError)

    with ctx:
        await middleware.dispatch(request, call_next)
