from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

import highlight_io


class FastAPIMiddleware(BaseHTTPMiddleware):
    HIGHLIGHT_HEADER = "X-Highlight-Request"

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        session_id, request_id = "", ""
        try:
            session_id, request_id = request.headers.get(
                FastAPIMiddleware.HIGHLIGHT_HEADER
            ).split("/")
        except (AttributeError, KeyError, ValueError):
            pass

        with highlight_io.H.get_instance().trace(session_id, request_id):
            return await call_next(request)
