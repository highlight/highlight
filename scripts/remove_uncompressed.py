import os

import boto3

BUCKET = 'highlight-session-s3-test'
PREFIX = '1/'

HIGHLIGHT_FILES = {'session-contents', 'console-messages', 'network-resources'}

s3 = boto3.Session().resource('s3')
bucket = s3.Bucket(BUCKET)


def process():
    last = {'project': 0, 'session': 0}
    has_compressed = {k: False for k in HIGHLIGHT_FILES}

    def process_if_compressed():
        if all(has_compressed.values()):
            process_uncompressed(**last)

    for idx, f in enumerate(bucket.objects.filter(Prefix=PREFIX)):
        try:
            p, s, obj = str(f.key).split(os.path.sep)
        except ValueError:
            continue
        p, s = int(p), int(s)

        if p != last['project'] or s != last['session']:
            process_if_compressed()
            last = {'project': p, 'session': s}
            has_compressed = {k: False for k in HIGHLIGHT_FILES}

        for k in HIGHLIGHT_FILES:
            if f'{k}-compressed' == obj:
                has_compressed[k] = True
                break

    process_if_compressed()


def process_uncompressed(project=0, session=0):
    for f in bucket.objects.filter(Prefix='/'.join(map(str, [project, session]))):
        if 'compressed' in f.key:
            continue
        if f.storage_class == 'DEEP_ARCHIVE':
            print(project, session, f, 'already', f.storage_class, 'skipping')

            # In case the object needs to be restored:
            # r = f.restore_object(Bucket=BUCKET, Key=f.key, RestoreRequest={'Days': 1})
            # print(project, session, f, 'already', f.storage_class, 'RESTORED', r)
            continue
        print('ARCHIVING', project, session, f)
        bucket.copy(
            {'Bucket': BUCKET, 'Key': f.key}, f.key,
            ExtraArgs={
                'StorageClass': 'DEEP_ARCHIVE',
                'MetadataDirective': 'COPY'
            }
        )
    exit(0)


if __name__ == '__main__':
    process()
