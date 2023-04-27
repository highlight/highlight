import json
import sys
import urllib.parse
import boto3
import brotli

s3 = boto3.client('s3')
client = boto3.client('dynamodb')

def get_ancestors(node, edges):
    ancestors = set([node])
    if node in edges:
        ancestors |= get_ancestors(edges[node], edges)
    return ancestors

def get_edges(parent):
    edges = {}
    for child in parent.get('childNodes', []):
        edges.update(get_edges(child))
        edges[child['id']] = parent['id']
    return edges

def get_input_passwords(parent):
    passwords = set()
    if parent.get('tagName', '').lower() == 'input' and parent.get('attributes', {}).get('type', '').lower() == 'password':
        passwords.add(parent['id'])
    for child in parent.get('childNodes', []):
        passwords |= get_input_passwords(child)
    return passwords

def get_stable_passwords(parent):
    passwords = set()
    if parent.get('tagName', '').lower() == 'input':
        attrs = parent.get('attributes', {})
        if 'password' in attrs.get('autocomplete', '').lower() or \
            'password' in attrs.get('id', '').lower() or \
            'password' in attrs.get('name', '').lower():
            passwords.add(parent['id'])
    for child in parent.get('childNodes', []):
        passwords |= get_stable_passwords(child)
    return passwords

def get_maybe_passwords(parent):
    passwords = set()
    if parent.get('tagName', '').lower() == 'input' and parent.get('attributes', {}).get('type', '').lower() == 'text':
        passwords.add(parent['id'])
    for child in parent.get('childNodes', []):
        passwords |= get_maybe_passwords(child)
    return passwords

def get_children(nodes, edges):
    children = set(nodes)
    dirty = True
    while dirty:
        dirty = False
        for c, p in edges.items():
            if p in children and c not in children:
                dirty = True
                children.add(c)
    return children

def remove_node(node, edges):
    removals = get_children(set([node]), edges)
    new_edges = {}
    for c, p in edges.items():
        if c not in removals:
            new_edges[c] = p
    return new_edges

def get_sus_children(node, passwords):
    susses = set()
    if node.get('id', '') in passwords:
        val = node.get('attributes', {}).get('value', '')
        if val and not set('*') <= set(val):
            susses.add(node['id'])
            node['attributes']['value'] = '*' * len(val)
    for child in node.get('childNodes', []):
        susses |= get_sus_children(child, passwords)
    return susses

def get_sus(f):
    events = json.loads(f)
    edges = {}
    susses = set()
    passwords = set()
    unstable_passwords = set()
    for e in events:
        if e['type'] == 2:
            root = e['data']['node']
            edges = get_edges(root)
            inputs = get_input_passwords(root)
            stable = get_stable_passwords(root)
            unstable_passwords = inputs - stable
            passwords = inputs | stable
        elif e['type'] == 3:
            removed_passwords = set()
            removed_password_ancestors = set()
            id = e['data'].get('id', None)
            if id and id in passwords:
                text = e['data'].get('text', '')
                if text and not set('*') <= set(text):
                    susses.add(id)
                    e['data']['text'] = '*' * len(text)
            for r in e['data'].get('removes', []):
                for p in passwords:
                    if r['id'] in get_ancestors(p, edges):
                        removed_passwords.add(p)
                        if p in unstable_passwords:
                            removed_password_ancestors.add(edges[r['id']])
                edges = remove_node(r['id'], edges)
                passwords -= removed_passwords
                unstable_passwords -= removed_passwords
            for a in e['data'].get('attributes', []):
                susses |= get_sus_children(a, passwords)
            for a in e['data'].get('adds', []):
                if 'node' not in a:
                    continue
                node = a['node']
                edges[node['id']] = a['parentId']
                edges.update(get_edges(node))
                inputs = get_input_passwords(node)
                stable = get_stable_passwords(node)
                unstable_passwords |= inputs - stable
                passwords |= inputs | stable
                if a['parentId'] in removed_password_ancestors:
                    removed_password_ancestors.add(node['id'])
                    passwords |= get_maybe_passwords(node)
                susses |= get_sus_children(a['node'], passwords)
    if susses:
        return json.dumps(events)
    return None

# if __name__ == "__main__":
#     with open(sys.argv[1]) as f:
#         sus = get_sus(f.read())
#         if sus:
#             print(sus)
        # print('error!', 'zane/test', get_sus(f.read()))

def lambda_handler(event, context):
    # Get the object from the event and show its content type
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        if 'session-contents-compressed-' not in key:
            return
        response = s3.get_object(Bucket=bucket, Key=key)
        sus = get_sus(brotli.decompress(response['Body'].read()))
        if sus:
            newKey = key.replace('session-contents-compressed-', 'session-contents-compressed-v2-')
            response = client.put_item(
                TableName='password-chunks',
                Item={
                    'key': {
                        'S': newKey
                    }
                })
            print('sus!', newKey)
            compressed = brotli.compress(sus.encode(), quality=9)
            s3.put_object(Body=compressed, Bucket=bucket, Key=newKey, ContentEncoding='br', ContentType='application/json')
        return
    except Exception as e:
        print('error!', e)
        raise e
