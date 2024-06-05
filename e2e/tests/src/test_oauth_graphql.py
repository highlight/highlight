import time
import typing

import requests

GET_ADMIN = """
query GetAdmin {
	admin {
		id
		uid
		name
		email
	}
}
"""


def test_make_request_with_oauth(oauth_api):
    api_url, oauth_token = oauth_api
    exc: typing.Optional[Exception] = None
    # retry up for up to 30 seconds in case the session needs time to populate from datasync queue
    for _ in range(30):
        try:
            r = requests.post(
                api_url,
                json={
                    "operationName": "GetAdmin",
                    "variables": {},
                    "query": GET_ADMIN,
                },
                headers={"Authorization": f"Bearer {oauth_token}"},
            )
            assert r.status_code == 200
            j = r.json()
            assert len(j.get("errors") or []) == 0
            assert int(j["data"]["admin"]["id"]) > 0
            assert len(j["data"]["admin"]["email"]) > 0
            break
        except Exception as e:
            exc = e
            time.sleep(1)
    else:
        raise exc
