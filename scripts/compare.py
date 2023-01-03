import subprocess
import sys, getopt

services = {
    # services is a map of {service name}:{npm package name}
    "highlight-javascript/firstload": "highlight.run",
    "sourcemap-uploader": "@highlight-run/sourcemap-uploader",
    "highlight-javascript/highlight-next": "@highlight-run/next",
    "highlight-javascript/highlight-node": "@highlight-run/node"
}

def main(argv):
    try:
        opts, args = getopt.getopt(argv,"hs:",["service="])
    except getopt.GetoptError:
        print('compare.py -s <service>')
        exit(2)

    service = ''
    for opt, arg in opts:
        if opt == '-h':
            print('compare.py -s <service>')
            exit(1)
        elif opt in ("-s", "--service"):
            service = arg

    local = subprocess.check_output("node -p -e \"require('./package.json').version\"", shell=True, universal_newlines=True).replace('\r', '').replace('\n', '')
    remote = subprocess.check_output(f"npm show {services[service]} version", shell=True, universal_newlines=True).replace('\r', '').replace('\n', '')
    if local == remote:
        print(f"Error: any changes to {service} require an updated package number, please run `yarn version` to upgrade from: ", local)
        exit(1)
    exit(0)

if __name__ == "__main__":
   main(sys.argv[1:])

