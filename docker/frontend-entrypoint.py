import os
import re
import subprocess

CONSTANTS_FILE = '/build/frontend/build/assets/constants.js'
NGINX_CONFIG_FILE = '/etc/nginx/conf.d/default.conf'


def main():
    private = os.environ.get('REACT_APP_PRIVATE_GRAPH_URI')
    public = os.environ.get('REACT_APP_PUBLIC_GRAPH_URI')
    frontend = os.environ.get('REACT_APP_FRONTEND_URI')
    print("replacing", {"private": private, "public": public, "frontend": frontend})

    with open(CONSTANTS_FILE, 'r') as f:
        data = f.read()
        if private:
            data = re.sub('https://localhost:8082/private', private, data)
        if public:
            data = re.sub('https://localhost:8082/public', public, data)
        if frontend:
            data = re.sub('https://localhost:3000', frontend, data)

    with open(CONSTANTS_FILE, 'w') as f:
        f.write(data)

    with open(NGINX_CONFIG_FILE, 'r') as f:
        data = f.read()
        if frontend:
            port = frontend.split(':')[-1]
            try:
                port = int(port)
            except ValueError as e:
                port = 443
            data = re.sub('3000', str(port), data)

    with open(NGINX_CONFIG_FILE, 'w') as f:
        f.write(data)

    print("wrote back constants file", data, flush=True)
    return subprocess.check_call(["nginx", "-g", "daemon off;"])


if __name__ == '__main__':
    main()
