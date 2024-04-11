import os
from datetime import datetime, timedelta

import requests

from query_gql import (
    GET_SESSION,
    GET_SESSION_INTERVALS,
    GET_SESSIONS_CLICKHOUSE,
    GET_EVENT_CHUNKS,
    GET_EVENT_CHUNK_URL,
)

try:
    import brotli
except ImportError:
    print("You must install brotli to support events parsing.")
    print("pip install brotli")


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
            print(f"session_events {len(session_events)}")
            yield session["secure_id"], len(session_events)


if __name__ == "__main__":
    for secure_id, num_events in main():
        print("Fetched session data", secure_id, num_events)
