import logging
import os
import subprocess

import pytest
import requests
from semver import VersionInfo

from app_runner import run, run_and_poll


@pytest.fixture(scope="session")
def oauth_api():
    oauth_url, api_url = (
        "http://localhost:8082/oauth",
        "http://localhost:8082/private",
    )
    client_id, secret = "abc123", "def456"
    r = requests.post(
        f"{oauth_url}/token",
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
def dotnet_bin():
    stdout = subprocess.check_output(["which", "dotnet"], text=True, env=os.environ)
    return os.path.realpath(os.path.dirname(stdout))


@pytest.fixture()
def next_dev(node_js_bin):
    yield from run_and_poll(
        node_js_bin,
        ["yarn", "workspace", "nextjs", "dev"],
        lambda: requests.get("http://localhost:3005/"),
    )


@pytest.fixture()
def next_prod(node_js_bin):
    def build():
        proc = run(node_js_bin, ["yarn", "turbo", "run", "--filter", "nextjs", "build"])
        stdout, stderr = proc.communicate()
        logging.info("next build output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)

    yield from run_and_poll(
        node_js_bin,
        ["yarn", "workspace", "nextjs", "dev"],
        lambda: requests.get("http://localhost:3005/"),
        pre=build,
    )


@pytest.fixture(params=["next_dev", "next_prod"])
def next_app(request):
    yield request.param, request.getfixturevalue(request.param)


@pytest.fixture()
def express_js(node_js_bin):
    yield from run_and_poll(
        node_js_bin,
        ["node", "./src/index.mjs"],
        lambda: requests.get("http://localhost:3003/"),
        cwd="express",
    )


@pytest.fixture()
def express_ts(node_js_bin):
    def build():
        proc = run(
            node_js_bin, ["yarn", "turbo", "run", "--filter", "e2e-express-ts", "build"]
        )
        stdout, stderr = proc.communicate()
        logging.info("express-ts build output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)

    yield from run_and_poll(
        node_js_bin,
        ["node", "./dist/index.js"],
        lambda: requests.get("http://localhost:3003/"),
        pre=build,
        cwd="express-ts",
    )


@pytest.fixture(params=["express_js", "express_ts"])
def express_app(request):
    yield request.param, request.getfixturevalue(request.param)


@pytest.fixture()
def dotnet_app(dotnet_bin):
    yield from run_and_poll(
        dotnet_bin,
        ["dotnet", "run"],
        lambda: requests.get("http://localhost:5249/"),
        cwd="dotnet",
    )
