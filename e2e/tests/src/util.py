import logging
import time
from datetime import datetime
from typing import Optional, Callable

import requests


def query(
    oauth_api: tuple[str, str],
    operation_name: str,
    query: str,
    variables: Optional[dict[str, any]] = None,
    variables_fn: Optional[Callable[[datetime], dict[str, any]]] = None,
    validator: Optional[Callable[[dict[str, any]], None]] = None,
):
    api_url, oauth_token = oauth_api
    exc: Optional[Exception] = None
    # retry up for up to N seconds in case the data needs time to populate
    for _ in range(600):
        try:
            if variables_fn:
                variables = variables_fn(datetime.utcnow())
            json = {
                "operationName": operation_name,
                "variables": variables,
                "query": query,
            }
            r = requests.post(
                api_url,
                json=json,
                headers={"Authorization": f"Bearer {oauth_token}"},
                timeout=30,
            )
            logging.info(f"POST {r.url} {json} {r.status_code} {r.text}")
            assert r.status_code == 200
            j = r.json()
            assert len(j.get("errors") or []) == 0
            if validator:
                try:
                    validator(j["data"])
                except Exception as e:
                    logging.error(f"validator failed: {e}")
                    raise
            return j["data"]
        except Exception as e:
            exc = e
            time.sleep(0.1)
    else:
        raise exc
