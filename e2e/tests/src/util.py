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
    start = datetime.now()
    # retry up for up to N seconds in case the data needs time to populate
    for _ in range(60):
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
            assert r.status_code == 200
            j = r.json()
            assert len(j.get("errors") or []) == 0
            if validator:
                try:
                    validator(j["data"])
                except Exception as e:
                    raise
            logging.info(
                f"POST {r.url} {json} succeeded after {datetime.now() - start}"
            )
            return j["data"]
        except Exception as e:
            exc = e
            time.sleep(1)
    else:
        logging.error(f"validator failed: {exc}")
        raise exc
