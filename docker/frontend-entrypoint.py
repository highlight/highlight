import os
import re
import subprocess

CONSTANTS_FILE = '/build/frontend/build/assets/constants.js'


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

    print("wrote back constants file", data, flush=True)
    return subprocess.check_call(["nginx", "-g", "daemon off;"])


if __name__ == '__main__':
    main()
