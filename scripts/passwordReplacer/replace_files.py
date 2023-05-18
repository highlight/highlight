import boto3
import os
from multiprocessing import Pool

bucket = 'highlight-session-data'

s3 = boto3.client('s3', 
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name="us-east-2",
)
dynamoClient = boto3.client('dynamodb', 
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name="us-east-2",
)

def f(v2_key):
    cur_key = v2_key.replace('v2-', '')
    old_key = cur_key + "-old"
    print(v2_key, cur_key, old_key)
    s3.copy_object(
        Bucket="highlight-session-data", CopySource="highlight-session-data/"+cur_key, Key=old_key)
    s3.copy_object(
        Bucket="highlight-session-data", CopySource="highlight-session-data/"+v2_key, Key=cur_key)
    response = dynamoClient.put_item(
        TableName='password-chunks',
        Item={
            'key': {
                'S': v2_key
            },
            'finished': {
                'BOOL': True
            }
        })

if __name__ == "__main__":
    paginator = dynamoClient.get_paginator('scan')
    pages = paginator.paginate(TableName='password-chunks', ScanFilter={
        'finished': {
            'ComparisonOperator': 'NULL'
        }
    })

    with Pool(50) as p:
        for page in pages:
            # print(page)
            # break
            # print(page['NextContinuationToken'])
            items = []
            count = 0
            for obj in page['Items']:
                v2_key = obj['key']['S']
                items.append(v2_key)
                count += 1
                if count >= 2:
                    break
            p.map(f, items)
            break
