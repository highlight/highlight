import requests

from src.query_gql import GET_ADMIN


def test_auth():
    r = requests.post(
        "https://pri.highlight.io",
        json={
            "operationName": "GetAdmin",
            "variables": {},
            "query": GET_ADMIN,
        },
        headers={},
        timeout=30,
    )
    print(r.ok)
