"""A utility for deleting github action run logs."""

import argparse
import subprocess
import time

REPO = "highlight/highlight"


def get_runs(workflow: str):
    stdout = subprocess.check_output(
        [
            "gh",
            "api",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/actions/workflows/{workflow}/runs",
            "--paginate",
            "--jq",
            '.workflow_runs[] | select(.conclusion != "") | .id',
        ],
        text=True,
    )
    for line in stdout.splitlines():
        yield int(line)


def delete_logs(run_id: int):
    subprocess.check_call(
        [
            "gh",
            "api",
            "--silent",
            "--method",
            "DELETE",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/actions/runs/{run_id}/logs",
        ]
    )
    time.sleep(0.1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workflow", help="The name of the github workflow")
    parser.add_argument(
        "--delete", action="store_true", help="Actually delete workflow logs"
    )
    args = parser.parse_args()
    for run in get_runs(args.workflow):
        if args.delete:
            print(f"Deleting logs for {run}")
            delete_logs(run)
        else:
            print(f"Not deleting logs for {run}")


if __name__ == "__main__":
    main()
