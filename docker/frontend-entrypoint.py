CONSTANTS_FILE = '/build/frontend/build/assets/constants.js'

def main():
    private = os.environ.get('REACT_APP_PRIVATE_GRAPH_URI')
    public = os.environ.get('REACT_APP_PUBLIC_GRAPH_URI')
    with open(CONSTANTS_FILE, 'rw') as f:
        data = f.read()
        data = re.replace(data, 'https://localhost:8082/private', private)
        data = re.replace(data, 'https://localhost:8082/public', public)
        f.write(data)

    return subprocess.check_call(["nginx", "-g", "daemon off;"])

if __name__ == '__main__':
    main()
