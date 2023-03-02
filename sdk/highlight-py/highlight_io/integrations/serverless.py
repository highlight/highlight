import functools

from highlight_io import H


def observe_serverless(highlight_header_value: str, fn):
    """
    Generic decorator for serverless request handlers. Extracts the request context
    to associate the request in azure functions, aws lambda, gcp, etc.
    :param highlight_header_value: the highlight header value from the current serverless request.
    :param fn: a function handler that the decorator is applied to.
    :return: a wrapped function that will record exceptions.
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        session_id, request_id = "", ""
        try:
            session_id, request_id = highlight_header_value.split("/")
        except ValueError:
            pass
        with H.get_instance().trace(session_id, request_id):
            return fn(*args, **kwargs)

    return wrapper
