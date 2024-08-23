import logging
import os
import signal
import subprocess
from typing import Optional, Callable

import requests
import sys
import time

root = logging.getLogger()
root.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
root.addHandler(handler)


def run(
    bin_dir: str,
    args: list[str],
    cwd: Optional[str] = None,
    env: dict[str, str] = None,
    stream: bool = False,
):
    logging.debug("running cmd %s in %s with PATH %s", args, cwd, bin_dir)
    out = None if stream else subprocess.PIPE
    return subprocess.Popen(
        args,
        env=os.environ | {"PATH": f'{os.environ["PATH"]}:{bin_dir}'} | (env or {}),
        stdout=out,
        stderr=out,
        text=True,
        cwd=os.path.realpath(
            os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, cwd or "")
        ),
    )


def run_and_poll(
    node_bin: str,
    args: list[str],
    request: Optional[Callable[[], requests.Response]],
    pre: Optional[Callable[[], None]] = None,
    cwd: Optional[str] = None,
):
    if pre:
        pre()
    proc = run(node_bin, args, cwd=cwd)
    try:
        for _ in range(60):
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
        proc.send_signal(signal.SIGINT)
        proc.terminate()
        stdout, stderr = proc.communicate()
        logging.info("app output")
        for line in stdout.splitlines():
            logging.info(line)
        for line in stderr.splitlines():
            logging.info(line)


def get_docker_bin():
    stdout = subprocess.check_output(["which", "docker"], text=True, env=os.environ)
    return os.path.realpath(os.path.dirname(stdout))


def run_example_in_docker(example_name: str):
    docker_bin = get_docker_bin()
    e2e_dir = os.path.realpath(os.path.join(__file__, os.pardir, os.pardir, os.pardir))
    assert os.path.isdir(f"{e2e_dir}/{example_name}"), "example not found"

    base = "ghcr.io/highlight/e2e-base:latest"
    image = f"ghcr.io/highlight/e2e-{example_name}:latest"
    env = {"IMAGE_BASE_NAME": base}

    proc = run(
        docker_bin,
        ["docker", "build", "-t", base, "-f", "base.Dockerfile", "."],
        cwd=e2e_dir,
        env=env,
        stream=True,
    )
    _, stderr = proc.communicate()
    assert not proc.returncode, stderr

    proc = run(
        docker_bin,
        ["docker", "build", "-t", image, "-f", f"{example_name}/Dockerfile", "."],
        cwd=e2e_dir,
        env=env,
        stream=True,
    )
    _, stderr = proc.communicate()
    assert not proc.returncode, stderr

    proc = run(
        docker_bin, ["docker", "run", "--rm", image, "env"], cwd=e2e_dir, env=env
    )
    docker_env, stderr = proc.communicate()
    assert not proc.returncode, stderr
    docker_env = {
        e.split("=", 1)[0]: e.split("=", 1)[1] for e in docker_env.split("\n") if e
    }
    frontend_uri, backend_uri = (
        docker_env[key] for key in ("FRONTEND_URI", "BACKEND_URI")
    )
    backend_port, frontend_port = (
        e.split(":")[-1].split("/")[0] for e in (frontend_uri, backend_uri)
    )
    logging.info("frontend port: %s backend port: %s", backend_port, frontend_port)

    proc = run(
        docker_bin,
        [
            "docker",
            "run",
            "-d",
            "-p",
            f"{frontend_port}:{frontend_port}",
        ]
        + (
            [
                "-p",
                f"{backend_port}:{backend_port}",
            ]
            if backend_port != frontend_port
            else []
        )
        + [image],
        cwd=e2e_dir,
        env=env,
    )
    docker_container, stderr = proc.communicate()
    assert not proc.returncode, stderr
    docker_container = docker_container.strip()
    logging.info("started docker container: %s", docker_container)

    try:
        for _ in range(60):
            try:
                r = requests.get(frontend_uri)
                if r.ok:
                    break
                else:
                    logging.debug("bad response %d: %s", r.status_code, r.text)
            except requests.RequestException:
                pass
            time.sleep(1)
        else:
            raise Exception("app not ready")
    finally:
        proc = run(
            docker_bin, ["docker", "logs", docker_container], cwd=e2e_dir, env=env
        )
        stdout, stderr = proc.communicate()
        assert not proc.returncode, stderr
        logging.info("docker container logs: %s, %s", stdout, stderr)

        proc = run(
            docker_bin, ["docker", "rm", "-f", docker_container], cwd=e2e_dir, env=env
        )
        _, stderr = proc.communicate()
        assert not proc.returncode, stderr
        logging.info("stopped docker container: %s", docker_container)


if __name__ == "__main__":
    apps = [
        "dotnet",
        "dotnet4",
        "express",
        "express-ts",
        # "go",
        # "nextjs",
        # "python",
        # "ruby",
    ]
    for app in apps:
        run_example_in_docker(app)
