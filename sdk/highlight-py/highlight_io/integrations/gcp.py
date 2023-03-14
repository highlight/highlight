from highlight_io import H
from highlight_io.integrations.serverless import observe_serverless


def observe_handler(fn):
    """
    Decorator for serverless request handlers. Extracts the request context
    to associate the request in google cloud functions.
    :param fn: a function handler that the decorator is applied to.
    :return: a wrapped function that will record exceptions.
    """

    def get_highlight_header(*args, **kwargs):
        highlight_header_value: str = ""
        if args and args[0] and args[0].headers and callable(args[0].headers.get):
            highlight_header_value = args[0].headers.get(H.REQUEST_HEADER) or ""
        return highlight_header_value

    return observe_serverless(get_highlight_header, fn)
