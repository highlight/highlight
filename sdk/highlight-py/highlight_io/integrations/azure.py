import functools
import azure.functions as func

from highlight_io import H


def observe_handler(fn):
    """
    Decorator for serverless request handlers. Extracts the request context
    to associate the request in azure functions, aws lambda, etc.
    :param fn: a function handler that the decorator is applied to.
    :return: a wrapped function that will record exceptions.
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        session_id, request_id = "", ""
        if args and args[0] and isinstance(args[0], func.HttpRequest):
            req: func.HttpRequest = args[0]
            try:
                session_id, request_id = (
                    req.headers.get(H.REQUEST_HEADER) or ""
                ).split("/")
            except ValueError:
                pass
        with H.get_instance().trace(session_id, request_id):
            return fn(*args, **kwargs)

    return wrapper
