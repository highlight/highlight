import argparse
import multiprocessing.pool
import os
import threading

import boto3

ARCHIVE_STORAGE_CLASS = 'DEEP_ARCHIVE'
HIGHLIGHT_FILES = {'session-contents', 'console-messages', 'network-resources'}


def init_bucket(bucket):
    s3 = boto3.Session().resource('s3')
    return s3.Bucket(bucket)


def process(bucket, prefix, do_archive=False):
    pool = multiprocessing.pool.Pool()
    b = init_bucket(bucket)
    last = {'project': 0, 'session': 0}
    has_compressed = {k: False for k in HIGHLIGHT_FILES}

    def process_if_compressed():
        if all(has_compressed.values()):
            pool.apply_async(process_uncompressed, args=(bucket,), kwds={'do_archive': do_archive, **last})

    for idx, f in enumerate(b.objects.filter(Prefix=prefix)):
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
    print('thread pool closed')
    pool.close()
    print('waiting for thread pool to finish...')
    pool.join()
    print('done!')


def process_uncompressed(bucket, project=0, session=0, do_archive=False):
    local = threading.local()
    if not getattr(local, 'b', None):
        local.b = init_bucket(bucket)
    for f in local.b.objects.filter(Prefix='/'.join(map(str, [project, session]))):
        if 'compressed' in f.key:
            continue
        if f.storage_class == ARCHIVE_STORAGE_CLASS:
            print(project, session, f, 'already', ARCHIVE_STORAGE_CLASS, 'skipping')

            # In case the object needs to be restored:
            # r = f.restore_object(Bucket=BUCKET, Key=f.key, RestoreRequest={'Days': 1})
            # print(project, session, f, 'already', f.storage_class, 'RESTORED', r)
            continue

        if not do_archive:
            print('dry run, not actually archiving', project, session, f)
            continue
        print('ARCHIVING', project, session, f)
        local.b.copy(
            {'Bucket': local.b.name, 'Key': f.key}, f.key,
            ExtraArgs={
                'StorageClass': ARCHIVE_STORAGE_CLASS,
                'MetadataDirective': 'COPY'
            }
        )


def main():
    parser = argparse.ArgumentParser(description='Description of your program')
    parser.add_argument('-b', '--bucket', help='the s3 bucket to process', default='highlight-session-s3-test')
    parser.add_argument('-p', '--prefix', help='the bucket prefix to process', default='1/')
    parser.add_argument('--do-archive', help='confirm archive files', default=False, action='store_true')
    process(**vars(parser.parse_args()))


if __name__ == '__main__':
    main()
