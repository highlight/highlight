import pytest
import requests


@pytest.mark.parametrize("success", ["true", "false"])
def test_next_js(next_app, success):
    print(next_app)
    r = requests.get(
        "http://localhost:3005/api/edge-test", params={"success": success}, timeout=30
    )
    if success == "true":
        assert r.ok
    else:
        assert not r.ok

    print(r.text)
