import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Callable

import pytest
import requests
from query_gql import GET_ERROR_GROUPS_CLICKHOUSE, GET_SESSIONS_CLICKHOUSE


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
    # retry up for up to N seconds in case the session needs time to populate from datasync queue
    for _ in range(30):
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
                verify=False,
                json=json,
                headers={"Authorization": f"Bearer {oauth_token}"},
                timeout=30,
            )
            logging.info(f"POST {r.url} {json} {r.status_code} {r.text}")
            assert r.status_code == 200
            j = r.json()
            assert len(j.get("errors") or []) == 0
            if validator:
                validator(j["data"])
            return j["data"]
        except Exception as e:
            exc = e
            time.sleep(1)
    else:
        raise exc


@pytest.mark.parametrize("success", ["true", "false"])
@pytest.mark.parametrize(
    "endpoint,expected_error",
    [
        (
            "/api/page-router-test",
            "Error: /pages/api/page-router-test.ts (Page Router)",
        ),
        (
            "/api/page-router-edge-test",
            "Error: /api/page-router-edge-test (Edge Runtime)",
        ),
        ("/api/app-router-test", "Error: /api/app-router-test (App Router)"),
        ("/api/edge-test", "Error: /api/edge-test (Edge Runtime)"),
    ],
    ids=["page-router-test", "page-router-edge-test", "app-router-test", "edge-test"],
)
def test_next_js(next_app, oauth_api, endpoint, expected_error, success):
    start = datetime.utcnow()
    r = requests.get(
        f"http://localhost:3005{endpoint}", params={"success": success}, timeout=30
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    if success == "true":
        assert r.ok
    else:
        assert not r.ok

    # check that the error came thru to highlight
    if success == "false":

        def validator(data: dict[str, any]):
            assert 0 < len(data["error_groups_clickhouse"]["error_groups"]) < 10
            # check that we actually received the edge runtime error
            events = set(
                map(
                    lambda eg: eg["event"][0],
                    data["error_groups_clickhouse"]["error_groups"],
                )
            )
            assert expected_error in events

        query(
            oauth_api,
            "GetErrorGroupsClickhouse",
            GET_ERROR_GROUPS_CLICKHOUSE,
            variables_fn=lambda ts: {
                "query": {
                    "isAnd": True,
                    "rules": [
                        ["error_state", "is", "OPEN"],
                        [
                            "error-field_timestamp",
                            "between_date",
                            f"{start.isoformat(timespec='milliseconds')}Z_"
                            f"{ts.isoformat(timespec='milliseconds')}Z",
                        ],
                    ],
                },
                "count": 10,
                "page": 1,
                "project_id": "1",
                "sort_desc": False,
            },
            validator=validator,
        )


def test_get_sessions_clickhouse(oauth_api):
    data = query(
        oauth_api,
        "GetSessionsClickhouse",
        GET_SESSIONS_CLICKHOUSE,
        variables={
            "query": {
                "isAnd": True,
                "rules": [],
            },
            "count": 10,
            "page": 1,
            "project_id": "1",
            "sort_desc": True,
        },
    )
    assert len(data["sessions_clickhouse"]["sessions"]) >= 1
