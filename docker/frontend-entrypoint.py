import os
import re
import subprocess

CONSTANTS_FILE = '/build/frontend/build/assets/constants.js'
NGINX_CONFIG_FILE = '/etc/nginx/conf.d/default.conf'


def main():
    private = os.environ.get('REACT_APP_PRIVATE_GRAPH_URI')
    public = os.environ.get('REACT_APP_PUBLIC_GRAPH_URI')
    frontend = os.environ.get('REACT_APP_FRONTEND_URI')
    use_ssl = os.environ.get('SSL') != 'false'
    print("replacing", {"private": private, "public": public, "frontend": frontend})

    with open(CONSTANTS_FILE, 'r') as f:
        data = f.read()
        if private:
            data = re.sub('http://localhost:8082/private', private, data)
        if public:
            data = re.sub('http://localhost:8082/public', public, data)
        if frontend:
            data = re.sub('http://localhost:3000', frontend, data)

    try:
        with open(CONSTANTS_FILE, 'w') as f:
                f.write(data)
                print("wrote back constants file", data, flush=True)
    except Exception as e:
        print("failed to write back nginx file ", e, data, flush=True)

    with open(NGINX_CONFIG_FILE, 'r') as f:
        data = f.read()
        if not use_ssl:
            data = re.sub('ssl http2 ', '', data)

    try:
        with open(NGINX_CONFIG_FILE, 'w') as f:
            f.write(data)
            print("wrote back nginx file", data, flush=True)
    except Exception as e:
        print("failed to write back nginx file ", e, data, flush=True)

    return subprocess.check_call(["nginx", "-g", "daemon off;"])


if __name__ == '__main__':
    main()
