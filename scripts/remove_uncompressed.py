import argparse
import json
import os
import re
import shutil
import tempfile
import threading
from json import JSONDecodeError
from multiprocessing import cpu_count, Queue
from multiprocessing.pool import Pool
from typing import List

import boto3
import brotli

WORKER_PREFETCH = 4
WORKERS = cpu_count() * 4
MAX_TASKS_WAITING = WORKERS * WORKER_PREFETCH

HIGHLIGHT_FILES = {"session-contents", "network-resources"}


class PatchedQueue:
    def __init__(self, simple_queue_max_size=MAX_TASKS_WAITING):
        self.simple_max = simple_queue_max_size

    def __getattr__(self, attr):
        if attr == "SimpleQueue":
            return lambda: Queue(maxsize=self.simple_max)
        # noinspection PyUnresolvedReferences
        return getattr(queue, attr)


class BoundedPool(Pool):
    # Override queue in this scope to use the patcher above
    queue = PatchedQueue()


def init_bucket(bucket):
    s3 = boto3.Session().resource("s3")
    return s3.Bucket(bucket)


def process(bucket, prefix, do_compress=False, do_delete=False, debug=False):
    pool = None
    if not debug:
        pool = BoundedPool(processes=WORKERS)

    b = init_bucket(bucket)
    last = {"project": "0", "session": "0"}
    has_compressed = {k: False for k in HIGHLIGHT_FILES}
    session_files = []

    def process_session_files():
        files = [x.key for x in session_files if not x.key.endswith("/")]
        if not files:
            return
        if debug:
            process_session(
                bucket,
                files,
                all_compressed=all(has_compressed.values()),
                do_compress=do_compress,
                do_delete=do_delete,
                **last,
            )
        else:
            pool.apply_async(
                process_session,
                args=(bucket, files),
                kwds={
                    "all_compressed": all(has_compressed.values()),
                    "do_compress": do_compress,
                    "do_delete": do_delete,
                    **last,
                },
            )

    for idx, f in enumerate(b.objects.filter(Prefix=prefix)):
        try:
            p, s, obj = str(f.key).split(os.path.sep)
        except ValueError:
            continue

        if p != last["project"] or s != last["session"]:
            process_session_files()
            session_files = []
            last = {"project": p, "session": s}
            has_compressed = {k: False for k in HIGHLIGHT_FILES}
        session_files.append(f)

        for k in HIGHLIGHT_FILES:
            if f"{k}-compressed" == obj:
                has_compressed[k] = True
                break

    process_session_files()
    if pool:
        pool.close()
        print("waiting for thread pool to finish...")
        pool.join()
    print("done!")


def process_session(
    bucket,
    files,
    all_compressed=False,
    do_delete=False,
    do_compress=False,
    project="0",
    session="0",
):
    local = threading.local()
    if not getattr(local, "b", None):
        local.b = init_bucket(bucket)

    if all_compressed and do_delete:
        delete_uncompressed(local, files, project, session)
    elif not all_compressed and do_compress:
        compress_uncompressed(local, files, project, session)
        if do_delete:
            delete_uncompressed(local, files, project, session)


def compress_uncompressed(local, files: List[str], project="0", session="0"):
    for f in files:
        if "compressed" in f:
            continue

        print("COMPRESSING", project, session, f)
        tmpdir = tempfile.mkdtemp()
        try:
            file_path = os.path.join(tmpdir, f.replace("/", "_"))
            local.b.download_file(f, file_path)
            with open(file_path, "r") as data_file:
                data_str = data_file.read()

            datum = []
            try:
                datum.append(json.loads(data_str))
            except JSONDecodeError:
                for msg_str in filter(
                    lambda s: s.strip(), re.split(r"\w*\n\n\n\w*", data_str)
                ):
                    datum.append(json.loads(msg_str))

            new_data_format = []
            if datum and any(x for x in datum):
                keys = set()
                for d in datum:
                    keys |= set(d)
                assert len(keys) == 1, "only one message type per file expected"
                p_key = list(keys)[0]
                for d in datum:
                    new_data_format += d[p_key]

            compressed = brotli.compress(json.dumps(new_data_format).encode())
            compressed_path = os.path.join(tmpdir, f"{f.replace('/', '_')}-compressed")
            with open(compressed_path, "wb") as data_file:
                data_file.write(compressed)
            local.b.upload_file(
                compressed_path,
                f"{f}-compressed",
                ExtraArgs={"ContentType": "application/json", "ContentEncoding": "br"},
            )
        finally:
            shutil.rmtree(tmpdir)


def delete_uncompressed(local, files: List[str], project="0", session="0"):
    files = list(filter(lambda x: "compressed" not in x, files))
    if not files:
        return
    print("DELETING", project, session, files)
    local.b.delete_objects(Delete={"Objects": [{"Key": f} for f in files]})


def main():
    parser = argparse.ArgumentParser(description="Description of your program")
    parser.add_argument(
        "-b",
        "--bucket",
        help="the s3 bucket to process",
        default="highlight-session-s3-test",
    )
    parser.add_argument(
        "-p", "--prefix", help="the bucket prefix to process", default="1/"
    )
    parser.add_argument(
        "--do-compress",
        help="confirm compress files",
        default=False,
        action="store_true",
    )
    parser.add_argument(
        "--do-delete", help="confirm delete files", default=False, action="store_true"
    )
    parser.add_argument(
        "-d",
        "--debug",
        help="debug (no multiprocessing)",
        default=False,
        action="store_true",
    )
    process(**vars(parser.parse_args()))


if __name__ == "__main__":
    main()
