import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Callable

import pytest
import requests

from query_gql import GET_ERROR_GROUPS_CLICKHOUSE, GET_LOGS


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
                try:
                    validator(j["data"])
                except Exception as e:
                    logging.error(f"validator failed: {e}")
                    raise
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
        f"http://localhost:3005{endpoint}",
        params={"success": success, "sql": "true"},
        timeout=30,
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
                    "rules": [],
                    "dateRange": {
                        "start_date": f'{start.isoformat(timespec="microseconds")}000-00:00',
                        "end_date": f'{ts.isoformat(timespec="microseconds")}000-00:00',
                    },
                },
                "count": 10,
                "page": 1,
                "project_id": "1",
                "sort_desc": False,
            },
            validator=validator,
        )


def test_express_log(express_app, oauth_api):
    express_app_type, _ = express_app
    start = datetime.utcnow()
    r = requests.get(
        f"http://localhost:3003/good",
        headers={"x-highlight-request": "abc123/def456"},
        timeout=30,
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    assert r.ok

    def validator(data: dict[str, any]):
        assert 0 < len(data["logs"]["edges"]) <= 50
        # check that we actually received the edge runtime error
        msgs = set(
            map(
                lambda eg: eg["node"]["message"],
                data["logs"]["edges"],
            )
        )

        exp = "some work happening"
        if express_app_type == "express_js":
            exp = 'some work happening {"result":'

        for msg in msgs:
            if exp in msg:
                break
        else:
            assert False, f"expected message {exp} not found: {msgs}"

        for item in filter(
            lambda eg: eg["node"]["message"] == exp, data["logs"]["edges"]
        ):
            assert (
                item["node"]["level"] == "warn"
                if express_app_type == "express_js"
                else "info"
            )
            assert item["node"]["secureSessionID"] == "abc123"
            assert (
                item["node"]["serviceName"] == "e2e-express"
                if express_app_type == "express_js"
                else "e2e-express-pino"
            )
            assert (
                item["node"]["serviceVersion"] == "git-sha"
                if express_app_type == "express_js"
                else "vadim"
            )

    query(
        oauth_api,
        "GetLogs",
        GET_LOGS,
        variables_fn=lambda ts: {
            "project_id": "1",
            "direction": "DESC",
            "params": {
                "query": "work happening",
                "date_range": {
                    "start_date": f'{start.isoformat(timespec="microseconds")}000-00:00',
                    "end_date": f'{ts.isoformat(timespec="microseconds")}000-00:00',
                },
            },
        },
        validator=validator,
    )


def test_express_error(express_app, oauth_api):
    start = datetime.utcnow() - timedelta(minutes=1)
    r = requests.get(
        f"http://localhost:3003/",
        headers={"x-highlight-request": "abc123/def456"},
        timeout=30,
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    assert r.ok

    def validator(data: dict[str, any]):
        assert 0 < len(data["error_groups_clickhouse"]["error_groups"]) < 10
        # check that we actually received the edge runtime error
        events = set(
            map(
                lambda eg: eg["event"][0],
                data["error_groups_clickhouse"]["error_groups"],
            )
        )
        if express_app[0] == "express_js":
            assert "this is a test error" in events
        else:
            assert "this is another test error" in events

    query(
        oauth_api,
        "GetErrorGroupsClickhouse",
        GET_ERROR_GROUPS_CLICKHOUSE,
        variables_fn=lambda ts: {
            "query": {
                "isAnd": True,
                "rules": [],
                "dateRange": {
                    "start_date": f'{start.isoformat(timespec="microseconds")}000-00:00',
                    "end_date": f'{ts.isoformat(timespec="microseconds")}000-00:00',
                },
            },
            "count": 10,
            "page": 1,
            "project_id": "1",
            "sort_desc": False,
        },
        validator=validator,
    )
