import functools

from highlight_io import H
from highlight_io.integrations.serverless import observe_serverless


def observe_handler(fn):
    """
    Decorator for serverless request handlers. Extracts the request context
    to associate the request in azure functions.
    :param fn: a function handler that the decorator is applied to.
    :return: a wrapped function that will record exceptions.
    """

    @functools.wraps(fn)
    def wrapper(request):
        highlight_header_value = request.headers.get(H.REQUEST_HEADER) or ""
        return observe_serverless(highlight_header_value, fn)(request)

    return wrapper
