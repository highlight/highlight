import os
from datetime import datetime, timedelta

import requests

try:
    import brotli
except ImportError:
    print("You must install brotli to support events parsing.")
    print("pip install brotli")

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

GET_SESSION = """
query GetSession($secure_id: String!) {
  session(secure_id: $secure_id) {
    secure_id
    os_name
    os_version
    browser_name
    browser_version
    environment
    app_version
    ip
    city
    state
    country
    postal
    fingerprint
    created_at
    payload_updated_at
    language
    user_object
    user_properties
    identifier
    identified
    client_id
    starred
    enable_strict_privacy
    enable_recording_network_contents
    field_group
    fields {
      name
      value
      type
      __typename
    }
    object_storage_enabled
    payload_size
    processed
    excluded
    excluded_reason
    has_rage_clicks
    has_errors
    within_billing_quota
    client_version
    firstload_version
    client_config
    is_public
    event_counts
    direct_download_url
    resources_url
    web_socket_events_url
    timeline_indicators_url
    deviceMemory
    last_user_interaction_time
    length
    active_length
    chunked
    __typename
  }
}
"""

GET_SESSION_INTERVALS = """
query GetSessionIntervals($session_secure_id: String!) {
  session_intervals(session_secure_id: $session_secure_id) {
    start_time
    end_time
    active
    duration
    __typename
  }
}
"""

GET_EVENT_CHUNKS = """
query GetEventChunks($secure_id: String!) {
  event_chunks(secure_id: $secure_id) {
    session_id
    chunk_index
    timestamp
    __typename
  }
}
"""

GET_EVENT_CHUNK_URL = """
query GetEventChunkURL($secure_id: String!, $index: Int!) {
  event_chunk_url(secure_id: $secure_id, index: $index)
}
"""

OAUTH_URL = "https://pri.highlight.io/oauth"
API_URL = "https://pri.highlight.io"

PROJECT_ID = os.environ["HIGHLIGHT_PROJECT_ID"]
CLIENT_ID = os.environ["HIGHLIGHT_OAUTH_CLIENT_ID"]
SECRET = os.environ["HIGHLIGHT_OAUTH_CLIENT_SECRET"]


def perform_oauth_flow():
    r = requests.post(
        f"{OAUTH_URL}/token",
        params={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": SECRET,
        },
    )
    assert r.status_code == 200, f"{r.status_code} - {r.text}"
    params = r.json()

    return params["access_token"]


def main():
    auth = perform_oauth_flow()

    r = requests.post(
        API_URL,
        json={
            "operationName": "GetSessionsClickhouse",
            "variables": {
                "query": {
                    "isAnd": True,
                    "rules": [],
                    "dateRange": {
                        "start_date": (datetime.now() - timedelta(days=90)).strftime(
                            "%Y-%m-%dT%H:%M:%S.%fZ"
                        ),
                        "end_date": datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    },
                },
                "count": 1_000,
                "page": 1,
                "project_id": PROJECT_ID,
                "sort_desc": True,
            },
            "query": GET_SESSIONS_CLICKHOUSE,
        },
        headers={"Authorization": f"Bearer {auth}"},
    )
    sessions = r.json()["data"]["sessions_clickhouse"]["sessions"]

    for session in sessions:
        r = requests.post(
            API_URL,
            json={
                "operationName": "GetSession",
                "variables": {"secure_id": session["secure_id"]},
                "query": GET_SESSION,
            },
            headers={"Authorization": f"Bearer {auth}"},
        )
        session_details = r.json()["data"]["session"]
        print(
            f'{session["secure_id"]}: {session["length"]}, {session_details["active_length"]}'
        )

        r = requests.post(
            API_URL,
            json={
                "operationName": "GetSessionIntervals",
                "variables": {"session_secure_id": session["secure_id"]},
                "query": GET_SESSION_INTERVALS,
            },
            headers={"Authorization": f"Bearer {auth}"},
        )
        session_intervals = r.json()["data"]["session_intervals"]
        print(f"session_intervals {session_intervals}")

        r = requests.post(
            API_URL,
            json={
                "operationName": "GetEventChunks",
                "variables": {"secure_id": session["secure_id"]},
                "query": GET_EVENT_CHUNKS,
            },
            headers={"Authorization": f"Bearer {auth}"},
        )
        event_chunks = r.json()["data"]["event_chunks"]
        print(f"event_chunks {event_chunks}")

        for event_chunk in event_chunks:
            r = requests.post(
                API_URL,
                json={
                    "operationName": "GetEventChunkURL",
                    "variables": {
                        "secure_id": session["secure_id"],
                        "index": event_chunk["chunk_index"],
                    },
                    "query": GET_EVENT_CHUNK_URL,
                },
                headers={"Authorization": f"Bearer {auth}"},
            )
            event_chunk_url = r.json()["data"]["event_chunk_url"]
            print(f"event_chunk_url {event_chunk_url}")

            # note: you must `pip install brotli` to be able to decode the result
            r = requests.get(event_chunk_url)
            assert r.ok, "request to event chunk url failed"
            session_events = r.json()
            print(f"session_events {len(session_events)} {session_events}")


if __name__ == "__main__":
    main()
