"""A utility for fetching github security alerts."""

import json
import subprocess
from io import StringIO

import pandas as pd

REPO = "highlight/highlight"


def get_dependabot():
    stdout = subprocess.check_output(
        [
            "gh",
            "api",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/dependabot/alerts?per_page=100&state=fixed",
            "--paginate",
        ],
        text=True,
    )
    security_advisory_keys = {
        "ghsa_id",
        "cve_id",
        "summary",
        "severity",
    }
    for alert in json.loads(stdout):
        yield {
            "score": alert["security_advisory"]["cvss"]["score"],
            # "created_at": alert["created_at"],
            "fixed_at": pd.to_datetime(alert["fixed_at"]).strftime("%m/%d/%Y"),
            # "days_to_fix": (
            #     pd.to_datetime(alert["fixed_at"]) - pd.to_datetime(alert["created_at"])
            # ).days,
        } | {
            k: v
            for k, v in alert["security_advisory"].items()
            if k in security_advisory_keys
        }


def get_code_scanning():
    stdout = subprocess.check_output(
        [
            "gh",
            "api",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/code-scanning/alerts?per_page=100&state=fixed",
            "--paginate",
        ],
        text=True,
    )
    security_advisory_keys = {
        "ghsa_id",
        "cve_id",
        "summary",
        "severity",
    }
    for alert in json.loads(stdout):
        yield {
            "score": alert["security_advisory"]["cvss"]["score"],
            # "created_at": alert["created_at"],
            "fixed_at": pd.to_datetime(alert["fixed_at"]).strftime("%m/%d/%Y"),
            # "days_to_fix": (
            #     pd.to_datetime(alert["fixed_at"]) - pd.to_datetime(alert["created_at"])
            # ).days,
        } | {
            k: v
            for k, v in alert["security_advisory"].items()
            if k in security_advisory_keys
        }


def dismiss_dependabot(alert_id):
    subprocess.check_call(
        [
            "gh",
            "api",
            "--method",
            "PATCH",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/dependabot/alerts/{alert_id}",
            "-f", "state=dismissed",
            "-f", "dismissed_reason=tolerable_risk",
            "-f", "dismissed_comment=Not used in production; end-to-end test."
        ]
    )


def process_e2e_dependabot():
    stdout = subprocess.check_output(
        [
            "gh",
            "api",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            "X-GitHub-Api-Version: 2022-11-28",
            f"/repos/{REPO}/dependabot/alerts?per_page=100&state=open",
            "--paginate",
        ],
        text=True,
    )
    for alert in json.loads(stdout):
        path = alert["dependency"]["manifest_path"]
        if path.startswith("e2e/") or path.startswith("sdk/highlight-ruby/e2e"):
            print(path, alert)
            dismiss_dependabot(alert["number"])


def main():
    process_e2e_dependabot()

    for k, fn in {
        # 'dependabot': get_dependabot,
        # "code_scanning": get_code_scanning
    }.items():
        js = json.dumps(list(fn()))
        df = pd.read_json(StringIO(js))
        df.to_csv(f"{k}.csv", encoding="utf-8", index=True)


if __name__ == "__main__":
    main()
