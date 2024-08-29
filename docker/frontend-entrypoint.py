import os
import re
import subprocess

CONSTANTS_FILE = "/build/frontend/build/assets/constants.js"
NGINX_CONFIG_FILE = "/etc/nginx/conf.d/default.conf"


def main():
    envs = {
        "REACT_APP_PRIVATE_GRAPH_URI": 'https://pri.highlight.io',
        "REACT_APP_PUBLIC_GRAPH_URI": 'https://pub.highlight.io',
        "REACT_APP_FRONTEND_URI": 'https://app.highlight.io',
        "REACT_APP_AUTH_MODE": 'firebase',
        "REACT_APP_OTLP_ENDPOINT": 'https://otel.highlight.io:4318',
        "REACT_APP_DISABLE_ANALYTICS": 'false',
    }
    use_ssl = os.environ.get("SSL") != "false"

    with open(CONSTANTS_FILE, "r") as f:
        data = f.read()
        print("read constants file", data, flush=True)

    for key, default in envs.items():
        env = os.environ.get(key)
        if env:
            print(
                "replacing",
                {key: key, "default": default, "value": env},
                flush=True,
            )
            data = re.sub(default, env, data)
    try:
        with open(CONSTANTS_FILE, "w") as f:
            f.write(data)
            print("wrote back constants file", data, flush=True)
    except Exception as e:
        print("failed to write back nginx file ", e, data, flush=True)

    with open(NGINX_CONFIG_FILE, "r") as f:
        data = f.read()
        if not use_ssl:
            data = re.sub("ssl http2 ", "", data, flags=re.MULTILINE)

    try:
        with open(NGINX_CONFIG_FILE, "w") as f:
            f.write(data)
            print("wrote back nginx file", data, flush=True)
    except Exception as e:
        print("failed to write back nginx file ", e, data, flush=True)

    return subprocess.check_call(["nginx", "-g", "daemon off;"])


if __name__ == "__main__":
    main()
