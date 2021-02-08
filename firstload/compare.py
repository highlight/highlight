import subprocess

local = subprocess.check_output("node -p -e \"require('./package.json').version\"", shell=True, universal_newlines=True).replace('\r', '').replace('\n', '')
remote = subprocess.check_output("npm show highlight.run version", shell=True, universal_newlines=True).replace('\r', '').replace('\n', '')
if local == remote:
    print("Error: any changes to firstload require an updated package number, please run `yarn version` to upgrade from: ", local)
    exit(1)
exit(0)
