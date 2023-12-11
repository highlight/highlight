import logging
import os
import subprocess
import time
from typing import Optional, Callable

import pytest
import requests
from semver import VersionInfo


def run(bin_dir: str, args: list[str]):
    return subprocess.Popen(
        args,
        env=os.environ | {"PATH": f'{os.environ["PATH"]}:{bin_dir}'},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=os.path.realpath(os.path.join(os.curdir, os.pardir, os.pardir)),
    )


def yarn_exec(
    node_bin: str,
    workspace: str,
    script: str,
    request: Optional[Callable[[], requests.Response]],
    pre: Optional[Callable[[], None]] = None,
):
    proc = run(node_bin, ["yarn", "workspace", workspace, script])
    if pre:
        pre()
    try:
        for _ in range(15):
            try:
                r = request()
                if r.ok:
                    break
            except requests.RequestException:
                pass
            time.sleep(1)
        else:
            raise Exception("app not ready")
        yield proc
    finally:
        proc.terminate()
        stdout, stderr = proc.communicate()
        logging.info("app output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)


@pytest.fixture(scope="session")
def oauth_api():
    oauth_url, api_url = (
        "https://localhost:8082/oauth",
        "https://localhost:8082/private",
    )
    client_id, secret = "abc123", "def456"
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

    return api_url, params["access_token"]


@pytest.fixture(scope="session")
def node_js_bin():
    try:
        stdout = subprocess.check_output(["which", "node"], text=True, env=os.environ)
        return os.path.realpath(os.path.dirname(stdout))
    except subprocess.CalledProcessError:
        pass

    base = os.path.join(os.environ["HOME"], ".nvm/versions/node")
    versions = []
    for f in os.listdir(base):
        if os.path.isdir(os.path.join(base, f)) and f.startswith("v"):
            versions.append(VersionInfo.parse(f[1:]))
    latest = max(versions)
    return os.path.realpath(os.path.join(base, f"v{latest}", "bin"))


@pytest.fixture(scope="session")
def next_dev(node_js_bin):
    yield from yarn_exec(
        node_js_bin, "nextjs", "dev", lambda: requests.get("http://localhost:3005/")
    )


@pytest.fixture(scope="session")
def next_prod(node_js_bin):
    def build():
        proc = run(node_js_bin, ["yarn", "workspace", "nextjs", "build"])
        stdout, stderr = proc.communicate()
        logging.info("next build output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)

    yield from yarn_exec(
        node_js_bin,
        "nextjs",
        "dev",
        lambda: requests.get("http://localhost:3005/"),
        pre=build,
    )


@pytest.fixture(scope="session", params=["next_dev", "next_prod"])
def next_app(request):
    yield request.getfixturevalue(request.param)


@pytest.fixture(scope="session")
def express_js(node_js_bin):
    yield from yarn_exec(
        node_js_bin,
        "e2e-express",
        "dev",
        lambda: requests.get("http://localhost:3003/"),
    )


@pytest.fixture(scope="session")
def express_ts(node_js_bin):
    def build():
        proc = run(node_js_bin, ["yarn", "workspace", "e2e-express-ts", "build"])
        stdout, stderr = proc.communicate()
        logging.info("express-ts build output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)

    yield from yarn_exec(
        node_js_bin,
        "e2e-express-ts",
        "start",
        lambda: requests.get("http://localhost:3003/"),
        pre=build,
    )


@pytest.fixture(scope="session", params=["express_js", "express_ts"])
def express_app(request):
    yield request.getfixturevalue(request.param)
