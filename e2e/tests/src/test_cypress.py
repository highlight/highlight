import json
from datetime import datetime, timedelta, timezone

import requests

from query_gql import (
    GET_SESSIONS,
    GET_SESSION,
    GET_SESSION_INTERVALS,
    GET_EVENT_CHUNKS,
    GET_EVENT_CHUNK_URL,
)
from util import query


def validate_sessions(data: dict[str, any]):
    sessions = data["sessions"]["sessions"]
    assert sessions


def validate_session(data: dict[str, any]):
    session = data["session"]
    assert session["secure_id"] != session["client_id"]
    assert session["identified"]
    assert session["language"]
    assert session["excluded"] is False
    assert session["processed"] is True
    for time_key in ("created_at", "last_user_interaction_time", "payload_updated_at"):
        value = datetime.strptime(
            session[time_key], "%Y-%m-%dT%H:%M:%S.%f%z"
        ).astimezone()
        assert (
            datetime.now().astimezone() - timedelta(days=1)
            < value
            < datetime.now().astimezone() + timedelta(days=1)
        )
    assert session["length"] > session["active_length"]

    user = json.loads(session["user_properties"])
    assert user["identified_email"] in {"false", "true"}


def test_cypress_session_attributes(oauth_api):
    data = query(
        oauth_api,
        "GetSessions",
        GET_SESSIONS,
        variables_fn=lambda ts: {
            "params": {
                "query": "",
                "date_range": {
                    "start_date": (datetime.now() - timedelta(days=1)).strftime(
                        "%Y-%m-%dT%H:%M:%S.%fZ"
                    ),
                    # TODO(vkorolik) investigate why the filtering is not precise (time zone issue?)
                    "end_date": (datetime.now() + timedelta(days=1)).strftime(
                        "%Y-%m-%dT%H:%M:%S.%fZ"
                    ),
                },
            },
            "count": 1_000,
            "page": 1,
            "project_id": 1,
            "sort_desc": True,
        },
        validator=validate_sessions,
    )

    for session in data["sessions"]["sessions"]:
        query(
            oauth_api,
            "GetSession",
            GET_SESSION,
            variables_fn=lambda ts: {"secure_id": session["secure_id"]},
            validator=validate_session,
        )

        data = query(
            oauth_api,
            "GetSessionIntervals",
            GET_SESSION_INTERVALS,
            variables_fn=lambda ts: {"session_secure_id": session["secure_id"]},
        )
        session_intervals = data["session_intervals"]
        assert len(session_intervals) >= 1
        assert any(interval["duration"] for interval in session_intervals)
        assert any(interval["active"] for interval in session_intervals)

        data = query(
            oauth_api,
            "GetEventChunks",
            GET_EVENT_CHUNKS,
            variables_fn=lambda ts: {"secure_id": session["secure_id"]},
        )
        event_chunks = data["event_chunks"]
        assert event_chunks

        for event_chunk in event_chunks:
            data = query(
                oauth_api,
                "GetEventChunkURL",
                GET_EVENT_CHUNK_URL,
                variables_fn=lambda ts: {
                    "secure_id": session["secure_id"],
                    "index": event_chunk["chunk_index"],
                },
            )
            event_chunk_url = data["event_chunk_url"]

            # note: you must `pip install brotli` to be able to decode the result
            r = requests.get(event_chunk_url)
            assert r.ok, "request to event chunk url failed"
            session_events = r.json()
            assert len(session_events)
