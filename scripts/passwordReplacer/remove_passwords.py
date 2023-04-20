import json
import sys
import urllib.parse
import boto3
import brotli

s3 = boto3.client('s3')

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

def get_passwords(parent):
    passwords = set()
    if parent.get('tagName', '').lower() == 'input':
        attrs = parent.get('attributes', {})
        if attrs.get('type', '').lower() == 'password' or \
            attrs.get('autocomplete', '').lower() in ['new-password', 'current-password'] or \
            attrs.get('id', '').lower() in ['new-password', 'current-password']:
            passwords.add(parent['id'])
    for child in parent.get('childNodes', []):
        passwords |= get_passwords(child)
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

def get_sus(f):
    events = json.loads(f)
    edges = {}
    susses = set()
    passwords = set()
    for e in events:
        if e['type'] == 2:
            root = e['data']['node']
            edges = get_edges(root)
            passwords = get_passwords(root)
        elif e['type'] == 3:
            removed_passwords = set()
            removed_password_ancestors = set()
            for r in e['data'].get('removes', []):
                for p in passwords:
                    if r['id'] in get_ancestors(p, edges):
                        removed_passwords.add(p)
                        removed_password_ancestors.add(edges[r['id']])
                edges = remove_node(r['id'], edges)
                passwords -= removed_passwords
            for a in e['data'].get('attributes', []):
                if 'attributes' not in a or 'id' not in a:
                    continue
                if a['id'] in passwords:
                    val = a['attributes'].get('value', '')
                    if val and not set('*') <= set(val):
                        susses.add(a['id'])
            for a in e['data'].get('adds', []):
                if 'node' not in a:
                    continue
                node = a['node']
                edges[node['id']] = a['parentId']
                edges.update(get_edges(node))
                passwords |= get_passwords(node)
                if a['parentId'] in removed_password_ancestors:
                    removed_password_ancestors.add(node['id'])
                    passwords |= get_maybe_passwords(node)
            # todo: add case where element added has value already set
    return susses

# if __name__ == "__main__":
#     with open(sys.argv[1]) as f:
#         print('error!', 'zane/test', get_sus(f.read()))

def lambda_handler(event, context):
    # Get the object from the event and show its content type
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        if 'session-contents-compressed-0' not in key:
            return
        response = s3.get_object(Bucket=bucket, Key=key)
        sus = get_sus(brotli.decompress(response['Body'].read()))
        if sus:
            print('sus!', key, sus)
        return
    except Exception as e:
        print('error!', e)
        raise e
