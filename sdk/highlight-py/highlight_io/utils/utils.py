import typing as t
import re


def trace_origin_url(tracing_origins: t.List[str] | bool, url: str) -> bool:
    """
    Check if the url matches a pattern in the list of tracing_origins.

    :param tracing_origins: the list of tracing origins or boolean
    :param url: the url to check
    :return: bool
    """
    if isinstance(tracing_origins, bool):
        return tracing_origins

    for origin in tracing_origins:
        if re.search(origin, url):
            return True

    return False
