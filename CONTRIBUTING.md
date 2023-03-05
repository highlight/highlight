# Getting Started as a [Highlight.io](https://highlight.io) Contributor

Welcome to the contributing guide! 

## Need support? 
<!-- Is there a particular link that's best to use for Discord? -->
- [Discord](https://discord.gg/3SyYuUJk) 
<!-- Add email -->
- TODO - Email
<!-- Add other? -->
- TODO - Other?

## System Setup
- Node (either of the past 2 lts versions, v18.14.2 or v16.19.1)
- git (2.13+)
<!-- What version of yarn? -->
- yarn (v TODO)
- Docker (19.03.0+), [configured](https://docs.docker.com/desktop/settings/mac/) based on system recommendations below:
  - 32GB+ systems
    - Memory: 16+ GB, CPUs: 4+
  - 16GB systems
    - Memory: 4 GB, Swap Memory: 4 GB, CPUs: 4+ 
    - *Note* - frontend will be deployed outside of Docker, requiring large chunk of RAM
  - < 16GB systems
    - Consider using GitHub Codespaces or a VM setup, such as AWS EC2, with 32GB+ RAM

## Repo Setup
1. Fork our monorepo available at [github.com/highlight/highlight](https://github.com/highlight/highlight). 
2. Clone your fork to your local machine - include the `--recurse-submodules` flag
```sh
git clone --recurse-submodules https://github.com/YOUR_GITHUB_ACCOUNT_HERE/highlight.git
```
3. Check that the `rrweb` folder is not empty - if it is, delete the clone and try cloning again using the `--recurse-submodules` flag

# Enable Dev Mode
* In the `docker/.env` file, edit the `COMPOSE_FILE` variable to match this:
```sh
COMPOSE_FILE=compose.yml:compose.dev.yml
# COMPOSE_FILE=compose.yml
```
* Alternatively, run `export COMPOSE_FILE=compose.yml:compose.dev.yml` to override the `COMPOSE_FILE` variable for a single shell session

# Run Dev Mode (32+ GB systems)

## 32+ GB Systems
* Run all Docker containers:
```sh
docker compose up --build -d
```
* The frontend and backend will now hot reload - have fun developing!
  <!-- Add process for addding dependencies -->
  * TODO - process for adding dependencies

# Run Dev Mode (16 GB systems)
* For 16GB systems, we'll setup the frontend to run outside of Docker. All other processes will run within Docker. 

1. Export env vars:
```sh
export REACT_APP_AUTH_MODE=simple \
REACT_APP_FRONTEND_URI=https://localhost:3000 \
REACT_APP_PRIVATE_GRAPH_URI=https://localhost:8082/private \
REACT_APP_PUBLIC_GRAPH_URI=https://localhost:8082/public \
ENVIRONMENT=dev
```
2. Check Node version
```sh
node --version
```
  * If using **Node 16**, no extra env vars are required. If using **Node 18**, add this env var:
```sh
export NODE_OPTIONS=--openssl-legacy-provider
```

3. From the repo's root, run:
```sh
yarn turbo run dev --filter frontend --filter @highlight-run/client
```

4. Open a new terminal (the shell running `yarn turbo` won't disconnect). Run:
```
cd docker
```
```
docker compose up --build -d backend
```

# Troubleshooting & More
* To get container stats, run:
```sh
docker stats
```

* To delete backend data, navigate to `/docker` and run:
```sh
docker compose down --remove-orphans
```
```
docker container prune && 
docker volume prune
```

# Pull Requests, Review Process
<!-- Add pr best practices -->
* TODO - PR best practices
<!-- Add description of review process  -->
* TODO - review process
<!-- Add notes about GitHub actions -->
* TODO - briefly describe the GitHub actions being used 

# Deployment
* After all GitHub action run successfully, you can see your contributions running live at [highlight.io](https://highlight.io)! 

**Thank you for contributing!**
