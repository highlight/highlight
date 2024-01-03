from fastapi import Request, Response
from opentelemetry.semconv.trace import SpanAttributes
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
            resp = await call_next(request)
            # if the request raises an `HTTPException`, the exception isn't propagated.
            # we detect this by checking the status code and recording a special type of error
            if resp.status_code >= 400:
                body = b""
                if hasattr(resp, "body"):
                    body = resp.body
                elif hasattr(resp, "body_iterator"):
                    async for chunk in resp.body_iterator:
                        if not isinstance(chunk, bytes):
                            chunk = chunk.encode(resp.charset)
                        body += chunk
                highlight_io.H.get_instance().record_http_error(
                    status_code=resp.status_code,
                    detail=body.decode(),
                    attributes={
                        "http.response.headers": resp.headers,
                        "http.request.headers": request.headers,
                        SpanAttributes.HTTP_METHOD: request.method,
                        SpanAttributes.HTTP_URL: str(request.url),
                    },
                )
                return Response(
                    content=body,
                    status_code=resp.status_code,
                    headers=dict(resp.headers),
                    media_type=resp.media_type,
                )

        return resp
