import functools

from highlight_io import H
from highlight_io.integrations.serverless import observe_serverless


def observe_handler(fn):
    """
    Decorator for serverless request handlers. Extracts the request context
    to associate the request in aws lambda.
    :param fn: a function handler that the decorator is applied to.
    :return: a wrapped function that will record exceptions.
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        highlight_header_value: str = ""
        if args and args[0] and callable(args[0].get):
            highlight_header_value = args[0].get(H.REQUEST_HEADER) or ""
        return observe_serverless(highlight_header_value, fn)(*args, **kwargs)

    return wrapper
