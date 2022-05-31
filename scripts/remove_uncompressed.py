import argparse
import os

import boto3

HIGHLIGHT_FILES = {'session-contents', 'console-messages', 'network-resources'}

s3 = boto3.Session().resource('s3')


def process(bucket, prefix, do_archive=False):
    b = s3.Bucket(bucket)
    last = {'project': 0, 'session': 0}
    has_compressed = {k: False for k in HIGHLIGHT_FILES}
    to_archive = []

    def process_if_compressed():
        if all(has_compressed.values()):
            process_uncompressed(b, to_archive, **last, do_archive=do_archive)

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
            to_archive = []

        for k in HIGHLIGHT_FILES:
            if f'{k}-compressed' == obj:
                has_compressed[k] = True
                break
        else:
            to_archive.append(f)

    process_if_compressed()


def process_uncompressed(b, files_to_archive, project=0, session=0, do_archive=False):
    for f in files_to_archive:
        if 'compressed' in f.key:
            continue
        if f.storage_class == 'DEEP_ARCHIVE':
            print(project, session, f, 'already', f.storage_class, 'skipping')

            # In case the object needs to be restored:
            # r = f.restore_object(Bucket=BUCKET, Key=f.key, RestoreRequest={'Days': 1})
            # print(project, session, f, 'already', f.storage_class, 'RESTORED', r)
            continue

        if not do_archive:
            print('dry run, not actually archiving', project, session, f)
            continue
        print('ARCHIVING', project, session, f)
        b.copy(
            {'Bucket': b.name, 'Key': f.key}, f.key,
            ExtraArgs={
                'StorageClass': 'DEEP_ARCHIVE',
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
