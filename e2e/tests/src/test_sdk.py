import logging
from datetime import datetime, timedelta

import pytest
import requests

from query_gql import GET_ERROR_GROUPS_CLICKHOUSE, GET_LOGS, GET_TRACES
from util import query


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


def test_dotnet_error(dotnet_app, oauth_api):
    start = datetime.utcnow() - timedelta(minutes=1)
    r = requests.get(
        f"http://localhost:5249/error",
        headers={"x-highlight-request": "a1b2c30001/aaa111"},
        timeout=30,
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    assert not r.ok

    def validator(data: dict[str, any]):
        assert 0 < len(data["error_groups_clickhouse"]["error_groups"]) < 10
        # check that we actually received the edge runtime error
        events = set(
            map(
                lambda eg: eg["event"][0],
                data["error_groups_clickhouse"]["error_groups"],
            )
        )

        exp = "oh no, a random error occurred "
        for error in events:
            if error.startswith(exp):
                break
        else:
            assert False, f"did not find expected error {exp}"

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


def test_dotnet_logs(dotnet_app, oauth_api):
    start = datetime.utcnow() - timedelta(minutes=1)
    r = requests.get(
        f"http://localhost:5249/weatherforecast",
        headers={"x-highlight-request": "a1b2c30002/aaa112"},
        timeout=30,
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    assert r.ok

    def validator_logs(data: dict[str, any]):
        assert 0 < len(data["logs"]["edges"]) <= 50
        # check that we actually received the edge runtime error
        msgs = set(
            map(
                lambda eg: eg["node"]["message"],
                data["logs"]["edges"],
            )
        )

        exp = "stormy weather ahead"

        for msg in msgs:
            if exp in msg:
                break
        else:
            assert False, f"expected message {exp} not found: {msgs}"

        for item in filter(
            lambda eg: eg["node"]["message"] == exp, data["logs"]["edges"]
        ):
            assert item["node"]["level"] == "warn"
            assert item["node"]["secureSessionID"] == "a1b2c30002"
            assert item["node"]["traceID"] == "aaa112"
            assert item["node"]["serviceName"] == "highlight-dot-net-example"
            assert item["node"]["serviceVersion"] == ""

    query(
        oauth_api,
        "GetLogs",
        GET_LOGS,
        variables_fn=lambda ts: {
            "project_id": "1",
            "direction": "DESC",
            "params": {
                "query": "telemetry.sdk.language=dotnet",
                "date_range": {
                    "start_date": f'{start.isoformat(timespec="microseconds")}000-00:00',
                    "end_date": f'{ts.isoformat(timespec="microseconds")}000-00:00',
                },
            },
        },
        validator=validator_logs,
    )


def test_dotnet_traces(dotnet_app, oauth_api):
    start = datetime.utcnow() - timedelta(minutes=1)
    r = requests.get(
        f"http://localhost:5249/weatherforecast",
        headers={"x-highlight-request": "a1b2c30002/aaa112"},
        timeout=30,
    )
    logging.info(f"GET {r.url} {r.status_code} {r.text}")
    assert r.ok

    def validator_traces(data: dict[str, any]):
        assert 0 < len(data["traces"]["edges"]) <= 50
        # check that we actually received the edge runtime error
        msgs = set(
            map(
                lambda eg: eg["node"]["spanName"],
                data["traces"]["edges"],
            )
        )

        for exp in {"GET /weatherforecast", "SomeWork", "child span"}:
            assert exp in msgs

            for item in filter(
                lambda eg: eg["node"]["spanName"] == exp, data["traces"]["edges"]
            ):
                assert item["node"]["projectID"] == 1
                assert item["node"]["secureSessionID"] == "a1b2c30002"
                assert item["node"]["traceID"] == "aaa112"
                assert item["node"]["serviceName"] == "highlight-dot-net-example"
                assert item["node"]["serviceVersion"] == ""
                assert item["node"]["duration"] > 1000

    query(
        oauth_api,
        "GetTraces",
        GET_TRACES,
        variables_fn=lambda ts: {
            "project_id": "1",
            "direction": "DESC",
            "params": {
                "query": "telemetry.sdk.language=dotnet",
                "date_range": {
                    "start_date": f'{start.isoformat(timespec="microseconds")}000-00:00',
                    "end_date": f'{ts.isoformat(timespec="microseconds")}000-00:00',
                },
            },
        },
        validator=validator_traces,
    )
