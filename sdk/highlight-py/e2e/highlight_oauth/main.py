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
      secure_id
      client_id
      fingerprint
      identifier
      identified
      os_name
      os_version
      browser_name
      browser_version
      ip
      city
      state
      country
      postal
      created_at
      language
      length
      active_length
      enable_recording_network_contents
      viewed
      starred
      processed
      has_rage_clicks
      has_errors
      fields {
        name
        value
        type
        id
        __typename
      }
      first_time
      user_properties
      event_counts
      last_user_interaction_time
      is_public
      excluded
      __typename
    }
    totalCount
    __typename
  }
}
"""

if os.environ.get('ENVIRONMENT') in {'test', 'dev'}:
    OAUTH_URL = "https://localhost:8082/oauth"
    API_URL = "https://localhost:8082/private"
else:
    OAUTH_URL = "https://pri.highlight.io/oauth"
    API_URL = "https://pri.highlight.io"

CLIENT_ID = os.environ["HIGHLIGHT_OAUTH_CLIENT_ID"]
SECRET = os.environ["HIGHLIGHT_OAUTH_CLIENT_SECRET"]


def perform_oauth_flow():
    r = requests.get(
        f"{OAUTH_URL}/token",
        verify=False,
        params={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": SECRET,
        },
    )
    assert r.status_code == 200
    params = r.json()

    return params["access_token"]


def make_request(url):
    auth = perform_oauth_flow()

    r = requests.post(
        API_URL,
        verify=False,
        json={
            "operationName": "GetSessionsClickhouse",
            "variables": {
                "query": {
                    "isAnd": True,
                    "rules": [
                        ["custom_processed", "is", "true"],
                        [
                            "custom_created_at",
                            "between_date",
                            "2023-09-12T03:51:47.260Z_2023-10-12T03:51:47.260Z",
                        ],
                    ],
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
    print(r.status_code)
    print(r.text)


def main():
    r = make_request(API_URL)


if __name__ == "__main__":
    main()
