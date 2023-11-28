import time
import typing

import pytest
import requests

# TODO(vkorolik) parse queries from `query.gql`
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

GET_ERROR_GROUPS_CLICKHOUSE = """
query GetErrorGroupsClickhouse(
	$project_id: ID!
	$count: Int!
	$query: ClickhouseQuery!
	$page: Int
) {
	error_groups_clickhouse(
		project_id: $project_id
		count: $count
		query: $query
		page: $page
	) {
		error_groups {
			created_at
			updated_at
			id
			secure_id
			type
			event
			state
			state
			snoozed_until
			environments
			stack_trace
			structured_stack_trace {
				fileName
				lineNumber
				functionName
				columnNumber
			}
			error_frequency
			error_metrics {
				error_group_id
				date
				name
				value
			}
			is_public
			project_id
			error_tag {
				id
				created_at
				title
				description
			}
		}
		totalCount
	}
}
"""


@pytest.mark.parametrize("success", ["true", "false"])
def test_next_js(next_app, success, oauth_api):
    print(next_app)
    r = requests.get(
        "http://localhost:3005/api/edge-test", params={"success": success}, timeout=30
    )
    if success == "true":
        assert r.ok
    else:
        assert not r.ok

    print(r.text)

    # TODO(vkorolik) check that the error came thru to highlight
    api_url, oauth_token = oauth_api
    exc: typing.Optional[Exception] = None
    # retry up for up to 30 seconds in case the session needs time to populate from datasync queue
    for _ in range(30):
        try:
            r = requests.post(
                api_url,
                verify=False,
                json={
                    "operationName": "GetErrorGroupsClickhouse",
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
                    "query": GET_ERROR_GROUPS_CLICKHOUSE,
                },
                headers={"Authorization": f"Bearer {oauth_token}"},
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


def test_get_sessions_clickhouse(oauth_api):
    api_url, oauth_token = oauth_api
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
                headers={"Authorization": f"Bearer {oauth_token}"},
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
