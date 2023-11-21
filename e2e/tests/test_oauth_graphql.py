import os
import typing

import requests
import time

GET_SESSIONS_CLICKHOUSE = """
query GetSessionsClickhouse($project_id: ID!, $count: Int!, $query: ClickhouseQuery!, $sort_desc: Boolean!, $sort_field: String, $page: Int) {
  sessions_clickhouse(
    project_id: $project_id
    count: $count
    query: $query
    sort_field: $sort_field
    sort_desc: $sort_desc
    page: $page
  ) {
    sessions {
      id
    }
    totalCount
    __typename
  }
}
"""


def perform_oauth_flow(oauth_url: str, oauth_credentials: tuple[str, str]):
    client_id, secret = oauth_credentials
    r = requests.post(
        f"{oauth_url}/token",
        verify=False,
        params={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": secret,
        },
    )
    assert r.status_code == 200, f"{r.status_code} - {r.text}"
    params = r.json()

    return params["access_token"]


def test_make_request_with_oauth(oauth_api, oauth_credentials):
    oauth_url, api_url = oauth_api
    auth = perform_oauth_flow(oauth_url, oauth_credentials)

    exc: typing.Optional[Exception] = None
    # retry up for up to 30 seconds in case the session needs time to populate from datasync queue
    for _ in range(30):
        try:
            r = requests.post(
                api_url,
                verify=False,
                json={
                    "operationName": "GetSessionsClickhouse",
                    "variables": {
                        "query": {
                            "isAnd": True,
                            "rules": [],
                        },
                        "count": 10,
                        "page": 1,
                        "project_id": "1",
                        "sort_desc": True,
                    },
                    "query": GET_SESSIONS_CLICKHOUSE,
                },
                headers={"Authorization": f"Bearer {auth}"},
            )
            assert r.status_code == 200
            j = r.json()
            assert len(j.get("errors") or []) == 0
            # E2E test will return 1 real session from the login cypress test
            assert len(j["data"]["sessions_clickhouse"]["sessions"]) >= 1
            break
        except Exception as e:
            exc = e
            time.sleep(1)
    else:
        raise exc
