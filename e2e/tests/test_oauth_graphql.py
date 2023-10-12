import os

import requests

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

OAUTH_URL = "https://localhost:8082/oauth"
API_URL = "https://localhost:8082/private"

CLIENT_ID = os.environ["HIGHLIGHT_OAUTH_CLIENT_ID"]
SECRET = os.environ["HIGHLIGHT_OAUTH_CLIENT_SECRET"]


def perform_oauth_flow():
    r = requests.post(
        f"{OAUTH_URL}/token",
        verify=False,
        params={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": SECRET,
        },
    )
    assert r.status_code == 200, f"{r.status_code} - {r.text}"
    params = r.json()

    return params["access_token"]


def test_make_request_with_oauth():
    auth = perform_oauth_flow()

    r = requests.post(
        API_URL,
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
    assert len(j["data"]["sessions_clickhouse"]["sessions"]) == 10
