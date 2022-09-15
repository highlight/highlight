import argparse
import json
import os
import subprocess

import boto3

DROP_KEYS = {'user_id', 'details', 'status'}


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


def process(bucket, secure_id):
    s3 = boto3.Session().resource('s3')
    b = s3.Bucket(bucket)

    session = run_sql(f"SELECT * FROM sessions WHERE secure_id = '{secure_id}'", prod=True)
    print(session)

    new_session = session.copy()
    new_session['project_id'] = 1
    keys = ", ".join(k for k in new_session.keys() if k not in DROP_KEYS)
    values = ", ".join(format_sql_value(new_session[k]) for k in new_session if k not in DROP_KEYS)
    run_sql(f'INSERT INTO public.sessions ({keys}) VALUES ({values}) ON CONFLICT DO NOTHING', insert=True)

    prefix = f'{session["project_id"]}/{session["id"]}'
    for file in b.objects.filter(Prefix=prefix).all():
        new_obj = b.Object(f'dev/1/{new_session["id"]}/{file.key.split("/")[-1]}')
        new_obj.copy({
            'Bucket': bucket,
            'Key': file.key
        })


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
        return json.loads(lines[-3])
    return None


def main():
    parser = argparse.ArgumentParser(description='Description of your program')
    parser.add_argument('-b', '--bucket', help='the s3 bucket to process', default='highlight-session-s3-test')
    parser.add_argument('secure_id', help='the session secure id')
    process(**vars(parser.parse_args()))


if __name__ == '__main__':
    main()
