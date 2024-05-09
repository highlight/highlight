import functools

from highlight_io import H


def observe_serverless(get_highlight_header, fn):
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
            session_id, request_id = get_highlight_header(*args, **kwargs).split("/")
        except ValueError:
            pass
        try:
            with H.get_instance().trace("observe_serverless", session_id, request_id):
                return fn(*args, **kwargs)
        finally:
            # cloud functions may terminate quickly after response is sent.
            # flush to make sure logs / traces are delivered.
            H.get_instance().flush()

    return wrapper
