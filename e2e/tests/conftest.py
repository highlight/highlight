import logging
import os
import signal
import subprocess
import time

import pytest
import requests
from semver import VersionInfo


@pytest.fixture()
def oauth_api():
    return "https://localhost:8082/oauth", "https://localhost:8082/private"


@pytest.fixture()
def oauth_credentials():
    return "abc123", "def456"


@pytest.fixture(scope="session")
def next_app():
    node_bin_dir: str = ''
    try:
        stdout = subprocess.check_output(["which", "node"], text=True, env=os.environ)
        node_bin_dir = os.path.realpath(os.path.dirname(stdout))
    except subprocess.CalledProcessError:
        pass
    if not node_bin_dir:
        base = os.path.join(os.environ['HOME'], '.nvm/versions/node')
        versions = []
        for f in os.listdir(base):
            if os.path.isdir(os.path.join(base, f)) and f.startswith('v'):
                versions.append(VersionInfo.parse(f[1:]))
        latest = max(versions)
        node_bin_dir = os.path.realpath(os.path.join(base, f'v{latest}', 'bin'))
    proc = subprocess.Popen(
        ["yarn", "workspace", "nextjs", "dev"],
        env=os.environ | {"PATH": f'{os.environ["PATH"]}:{node_bin_dir}'},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=os.path.realpath(os.path.join(os.curdir, os.pardir, os.pardir)),
    )
    try:
        for _ in range(15):
            try:
                r = requests.get("http://localhost:3005/")
                if r.ok:
                    break
            except requests.RequestException:
                pass
            time.sleep(1)
        else:
            raise Exception("next app not ready")
        yield proc
    finally:
        proc.terminate()
        stdout, stderr = proc.communicate()
        print("next app output")
        for line in stdout.splitlines():
            print(line)
        for line in stderr.splitlines():
            print(line)
