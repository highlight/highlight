import argparse
import json
import os
import subprocess

import boto3

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

DROP_SESSION_KEYS = {'user_id', 'details', 'status'}
DROP_ERROR_GROUP_KEYS = {'metadata_log', 'resolved'}
DROP_ERROR_OBJECT_KEYS = {'line_no', 'column_no', 'error_type'}


def format_sql_value(value: any) -> str:
    if value is None:
        return 'NULL'
    if value == 'True' or value == 'False':
        return str(value == 'True')
    if isinstance(value, float) or isinstance(value, int):
        return str(value)
    if isinstance(value, dict) or isinstance(value, list):
        return f"'{json.dumps(value)}'"
    return f"'{value}'"


def process(bucket, secure_id, copy_errors=False):
    s3 = boto3.Session().resource('s3')
    b = s3.Bucket(bucket)
    sourcemaps_bucket_name = 'source-maps-test'
    sourcemaps_bucket = s3.Bucket(sourcemaps_bucket_name)

    # Get session from prod
    session = run_sql(f"SELECT * FROM sessions WHERE secure_id = '{secure_id}'", prod=True)[0]
    print(f'Copying session {session["id"]} to your local DB...')

    # Prepare values for insert into dev DB
    new_session = session.copy()
    new_session['project_id'] = 1
    keys = ", ".join(k for k in new_session.keys() if k not in DROP_SESSION_KEYS)
    values = ", ".join(format_sql_value(new_session[k]) for k in new_session if k not in DROP_SESSION_KEYS)

    # Insert into dev DB
    run_sql(f'INSERT INTO public.sessions ({keys}) VALUES ({values}) ON CONFLICT DO NOTHING', insert=True)

    print("Copying session files from prod S3 to dev/1...")
    prefix = f'{session["project_id"]}/{session["id"]}'
    for file in b.objects.filter(Prefix=prefix).all():
        new_obj = b.Object(f'dev/1/{new_session["id"]}/{file.key.split("/")[-1]}')
        new_obj.copy({
            'Bucket': bucket,
            'Key': file.key
        })

    if not copy_errors:
        print("Finished copying session without errors. Run with `-e` to copy error groups/objects and sourcemaps.")
        return

    print("Copying error groups & objects to your local DB...")

    # Get error objects associated with session
    error_objects = run_sql(f"SELECT * FROM error_objects WHERE session_id = '{session['id']}'", prod=True)

    # Get error groups for error objects
    error_group_ids = map(lambda x: str(x['error_group_id']), error_objects)
    error_groups = run_sql(f"SELECT * FROM error_groups WHERE id IN ({','.join(error_group_ids)})", prod=True)

    # Insert error groups
    for error_group in error_groups:
        new_error_group = error_group.copy()
        new_error_group['project_id'] = 1
        new_error_group['mapped_stack_trace'] = None
        error_group_keys = ", ".join(k for k in new_error_group.keys() if k not in DROP_ERROR_GROUP_KEYS)
        error_group_values = ", ".join(format_sql_value(new_error_group[k]) for k in new_error_group if k not in DROP_ERROR_GROUP_KEYS)
        run_sql(f'INSERT INTO public.error_groups ({error_group_keys}) VALUES ({error_group_values}) ON CONFLICT DO NOTHING', insert=True)

    # Insert error objects
    for error_object in error_objects:
        new_error_object = error_object.copy()
        new_error_object['project_id'] = 1
        error_object_keys = ", ".join(k for k in new_error_object.keys() if k not in DROP_ERROR_OBJECT_KEYS)
        error_object_values = ", ".join(format_sql_value(new_error_object[k]) for k in new_error_object if k not in DROP_ERROR_OBJECT_KEYS)
        run_sql(f'INSERT INTO public.error_objects ({error_object_keys}) VALUES ({error_object_values}) ON CONFLICT DO NOTHING', insert=True)

    print("Copying JS and sourcemap files from prod S3 to dev/1...")
    sourcemaps_prefix = f'{session["project_id"]}'
    for file in sourcemaps_bucket.objects.filter(Prefix=sourcemaps_prefix).all():
        new_obj = sourcemaps_bucket.Object(f'dev/1/{file.key.split("/", 1)[-1]}')
        new_obj.copy({
            'Bucket': sourcemaps_bucket_name,
            'Key': file.key
        })

    print('Finished copying session and associated errors.')

def run_sql(sql='select 1;', prod=False, insert=False):
    if not insert:
        sql = f"SELECT ROW_TO_JSON(t) FROM (" + sql + f") t"
    secrets = json.loads(subprocess.check_output(
        ['doppler', 'secrets'] + (['-c', 'prod_aws'] if prod else []) + ['--json']
    ))
    cmd = ['psql', '-h', secrets['PSQL_HOST']['computed'],
           '-U', secrets['PSQL_USER']['computed'],
           secrets['PSQL_DB']['computed'], '-c', sql]
    env = os.environ.copy()
    env['PGPASSWORD'] = secrets['PSQL_PASSWORD']['computed']
    lines = subprocess.check_output(cmd, env=env, text=True).splitlines()
    if len(lines) > 2:
        return [json.loads(line) for line in lines[2:-2]]
    return None


def main():
    parser = argparse.ArgumentParser(description='Description of your program')
    parser.add_argument('-b', '--bucket', help='the s3 bucket to process', default='highlight-session-s3-test')
    parser.add_argument('-e', '--copy-errors', help='copy the error groups and objects of the session', default=False, action='store_true')
    parser.add_argument('secure_id', help='the session secure id')
    process(**vars(parser.parse_args()))


if __name__ == '__main__':
    main()
