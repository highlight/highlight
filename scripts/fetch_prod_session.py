"""
Fetch Session:
    python3 scripts/fetch_prod_session.py SESSION_SECURE_ID

Fetch Session + Errors:
    python3 scripts/fetch_prod_session.py SESSION_SECURE_ID -e

Prerequisites:
    brew install python
    virtualenv -p python3.8 ~/venvs/highlight
    source ~/venvs/highlight/bin/activate
    pip install -r scripts/requirements.txt
    python scripts/fetch_prod_session.py SESSION_SECURE_ID
"""

from argparse import ArgumentParser
import json
import os
import subprocess
from typing import Optional, Union

import boto3
import brotli
from tqdm import tqdm

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


DROP_SESSION_KEYS = {"user_id", "details", "status", "migration_state"}
DROP_ERROR_GROUP_KEYS = {"metadata_log", "resolved"}
DROP_ERROR_OBJECT_KEYS = {"line_no", "column_no", "error_type"}
DROP_TIMELINE_INDICATORS_KEYS = {"id"}
SESSIONS_FULL_FILE = "session-contents"
BATCH_INSERT_SIZE = 128


def serialize_sql(value: Optional[Union[str, float, int, dict, list]]) -> str:
    if value is None:
        return "NULL"
    if value == "True" or value == "False":
        return str(value == "True")
    if isinstance(value, float) or isinstance(value, int):
        return str(value)
    if isinstance(value, dict) or isinstance(value, list):
        return f"'{json.dumps(value)}'"
    if isinstance(value, str):
        value = value.replace("'", "''")
    return f"'{value}'"


def fetch(
    bucket: str,
    secure_id: str,
    copy_errors: bool = False,
    store: bool = False,
    fs_root: str = "/tmp/highlight-data",
):
    s3 = boto3.Session().resource("s3")
    b = s3.Bucket(bucket)
    sourcemaps_bucket_name = "highlight-source-maps"
    sourcemaps_bucket = s3.Bucket(sourcemaps_bucket_name)

    # Get session from prod
    logger.info(f"Fetching session {secure_id} from prod DB...")

    session = run_sql(
        f"SELECT * FROM sessions WHERE secure_id = '{secure_id}'", prod=True
    )
    if len(session) == 0:
        logger.error(f"Session {secure_id} not found in prod DB")
        return

    session = session[0]

    intervals = run_sql(
        f"SELECT * FROM session_intervals WHERE session_secure_id = '{secure_id}'",
        prod=True,
    )

    indicators = run_sql(
        f"SELECT * FROM timeline_indicator_events WHERE session_secure_id = '{secure_id}'",
        prod=True,
    )

    session_id = session["id"]
    useNewBucket = int(session_id) >= 150000000

    chunks = run_sql(
        f"SELECT * FROM event_chunks WHERE session_id = {session_id}", prod=True
    )

    # Prepare values for insert into dev DB
    new_session = session.copy()
    new_session["project_id"] = 1
    keys = ", ".join(k for k in new_session.keys() if k not in DROP_SESSION_KEYS)
    values = ", ".join(
        serialize_sql(new_session[k]) for k in new_session if k not in DROP_SESSION_KEYS
    )

    # Insert into dev DB
    logger.info(f'Copying session {session["id"]} to your local DB...')
    run_sql(
        f"""
            INSERT INTO sessions ({keys})
            VALUES ({values})
            ON CONFLICT DO NOTHING
        """,
        insert=True,
    )
    logger.info(f"Copying {len(intervals)} session_intervals...")
    for interval in intervals:
        run_sql(
            f"""
                INSERT INTO session_intervals ({", ".join(interval)})
                VALUES ({", ".join(map(serialize_sql, interval.values()))})
                ON CONFLICT DO NOTHING
            """,
            insert=True,
        )

    if indicators:
        logger.info(f"Copying {len(indicators)} timeline_indicator_events...")
        ti_keys = ", ".join(
            k for k in indicators[0].keys() if k not in DROP_TIMELINE_INDICATORS_KEYS
        )
        with tqdm(total=len(indicators), unit="evts") as pbar:
            for start in range(0, len(indicators), BATCH_INSERT_SIZE):
                batch = indicators[start : start + BATCH_INSERT_SIZE]
                indicators_bulk = ", ".join(
                    map(
                        lambda x: f'({", ".join(serialize_sql(x[k]) for k in x if k not in DROP_TIMELINE_INDICATORS_KEYS)})',
                        batch,
                    )
                )
                run_sql(
                    f"""
                        INSERT INTO timeline_indicator_events ({ti_keys})
                        VALUES {indicators_bulk}
                        ON CONFLICT DO NOTHING
                    """,
                    insert=True,
                )
                pbar.update(len(batch))

    inserted_session = run_sql(
        f"SELECT * FROM sessions WHERE secure_id = '{secure_id}'"
    )[0]
    logger.info(f"Copying {len(chunks)} event_chunks...")
    for chunk in chunks:
        chunk["session_id"] = inserted_session["id"]
        run_sql(
            f"""
                INSERT INTO event_chunks ({", ".join(chunk)})
                VALUES ({", ".join(map(serialize_sql, chunk.values()))})
                ON CONFLICT DO NOTHING
            """,
            insert=True,
        )

    versionPrefix = "v2/" if useNewBucket else ""
    prefix = f'{versionPrefix}{session["project_id"]}/{session["id"]}'
    logger.info(
        f"Copying session files from prod S3 prefix {prefix} to local fs and dev/1..."
    )
    for file in b.objects.filter(Prefix=prefix).all():
        file_name = file.key.split("/")[-1]
        new_name = f'{versionPrefix}dev/1/{new_session["id"]}/{file_name}'
        logger.info(f"Copying session file {prefix}/{file_name} to {new_name}...")
        new_obj = b.Object(new_name)
        new_obj.copy({"Bucket": bucket, "Key": file.key})
        if store and file_name.startswith(SESSIONS_FULL_FILE):
            decompressed_file = f"{file_name}-decompressed"
            logger.info(f"Storing decompressed file {decompressed_file}")
            new_obj.download_file(file_name)
            with open(file_name, "rb") as f:
                decompressed = brotli.decompress(f.read())
            with open(decompressed_file, "wb") as f:
                f.write(decompressed)

        local_dir = os.path.join(fs_root, "1", str(session["id"]))
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, file_name)
        logger.info(f"Downloading session file {prefix}/{file_name} to {local_path}...")
        new_obj.download_file(local_path)

    if not copy_errors:
        logger.info(
            "Finished copying session without errors. Run with `-e` to copy error groups/objects and sourcemaps."
        )
        return

    logger.info("Copying error groups & objects to your local DB...")

    # Get error objects associated with session
    error_objects = run_sql(
        f"SELECT * FROM error_objects WHERE session_id = '{session['id']}'", prod=True
    )
    if not error_objects:
        logger.info(
            f"No errors found for session {session['id']}. Skipping copying errors..."
        )
        return

    # Get error groups for error objects
    error_group_ids = map(lambda x: str(x["error_group_id"]), error_objects)
    error_groups = run_sql(
        f"SELECT * FROM error_groups WHERE id IN ({','.join(error_group_ids)})",
        prod=True,
    )

    # Insert error groups
    for error_group in tqdm(error_groups, desc="Copying error groups"):
        new_error_group = error_group.copy()
        new_error_group["project_id"] = 1
        new_error_group["mapped_stack_trace"] = None
        error_group_keys = ", ".join(
            k for k in new_error_group.keys() if k not in DROP_ERROR_GROUP_KEYS
        )
        error_group_values = ", ".join(
            serialize_sql(new_error_group[k])
            for k in new_error_group
            if k not in DROP_ERROR_GROUP_KEYS
        )
        run_sql(
            f"INSERT INTO public.error_groups ({error_group_keys}) VALUES ({error_group_values}) ON CONFLICT DO NOTHING",
            insert=True,
        )

    # Insert error objects
    for error_object in tqdm(error_objects, desc="Copying error objects"):
        new_error_object = error_object.copy()
        new_error_object["project_id"] = 1
        error_object_keys = ", ".join(
            k for k in new_error_object.keys() if k not in DROP_ERROR_OBJECT_KEYS
        )
        error_object_values = ", ".join(
            serialize_sql(new_error_object[k])
            for k in new_error_object
            if k not in DROP_ERROR_OBJECT_KEYS
        )
        run_sql(
            f"INSERT INTO public.error_objects ({error_object_keys}) VALUES ({error_object_values}) ON CONFLICT DO NOTHING",
            insert=True,
        )

    logger.info("Copying JS and sourcemap files from prod S3 to dev/1...")
    sourcemaps_prefix = f'{session["project_id"]}'
    files = [
        f for f in sourcemaps_bucket.objects.filter(Prefix=sourcemaps_prefix).all()
    ]
    for file in tqdm(
        files,
        desc="Copying JS & sourcemaps",
        unit="obj",
        total=len(files),
    ):
        new_obj = sourcemaps_bucket.Object(f'dev/1/{file.key.split("/", 1)[-1]}')
        new_obj.copy({"Bucket": sourcemaps_bucket_name, "Key": file.key})

    logger.info("Finished copying session and associated errors.")


def run_sql(sql="select 1;", prod=False, insert=False):
    if not insert:
        sql = f"SELECT ROW_TO_JSON(t) FROM (" + sql + f") t"
    secrets = json.loads(
        subprocess.check_output(
            ["doppler", "secrets"] + (["-c", "prod_aws"] if prod else []) + ["--json"]
        )
    )
    cmd = [
        "psql",
        "-h",
        secrets["PSQL_HOST"]["computed"],
        "-U",
        secrets["PSQL_USER"]["computed"],
        secrets["PSQL_DB"]["computed"],
        "-c",
        sql,
    ]
    env = os.environ.copy()
    env["PGPASSWORD"] = secrets["PSQL_PASSWORD"]["computed"]
    lines = subprocess.check_output(cmd, env=env, text=True).splitlines()
    if len(lines) > 2:
        return [json.loads(line) for line in lines[2:-2]]


def main():
    parser = ArgumentParser(
        description="Fetch a session from prod and insert it into your local DB for project_id 1."
    )

    parser.add_argument("secure_id", help="the session secure id")

    parser.add_argument(
        "-b",
        "--bucket",
        help="the s3 bucket to process",
        default="highlight-session-data",
    )

    parser.add_argument(
        "-e",
        "--copy-errors",
        help="copy the error groups and objects of the session",
        default=False,
        action="store_true",
    )

    parser.add_argument(
        "-s",
        "--store",
        help="store the sessions file locally",
        default=False,
        action="store_true",
    )
    parser.add_argument(
        "--fs-root",
        type=str,
        help="where the local session files are stored",
        default="/tmp/highlight-data",
    )

    args = vars(parser.parse_args())

    fetch(**args)


if __name__ == "__main__":
    main()
