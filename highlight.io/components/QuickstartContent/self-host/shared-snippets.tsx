import { QuickStartStep } from '../QuickstartContent'

export const dependencies: QuickStartStep = {
	title: 'Prerequisites',
	content:
		'Before we get started, you should install [Go](https://go.dev/) (1.21), [Node.js](https://nodejs.org/en) (18+), and [yarn](https://yarnpkg.com/getting-started/install) (1+). ' +
		'You should have the latest version of [Docker](https://docs.docker.com/engine/install/) (25.0+) with the [docker compose plugin](https://docs.docker.com/compose/install/linux/) (2.24+) ' +
		'and [Git](https://git-scm.com/downloads) (2.13+) installed. ' +
		'We suggest [configuring docker](https://docs.docker.com/desktop/settings/mac/#resources) ' +
		'to use at least 8GB of RAM, 4 CPUs, and 64 GB of disk space.',
	code: [
		{
			language: 'bash',
			copy: 'go version',
			text: `$ go version
go version go1.21.6 linux/arm64`,
		},
		{
			language: 'bash',
			copy: 'node --version',
			text: `$ node --version
v18.15.0`,
		},
		{
			language: 'bash',
			copy: 'yarn --version',
			text: `$ yarn --version
4.0.2`,
		},
		{
			language: 'bash',
			copy: 'docker --version',
			text: `$ docker --version
Docker version 25.0.3, build 4debf41`,
		},
		{
			language: 'bash',
			copy: 'docker compose version',
			text: `$ docker compose version
Docker Compose version v2.24.5`,
		},
	],
}

export const clone: QuickStartStep = {
	title: 'Clone the repository.',
	content:
		'Clone the [highlight.io](https://github.com/highlight/highlight) repository and make sure to checkout the submodules with the `--recurse-submodules` flag.',
	code: [
		{
			text: `git clone --recurse-submodules https://github.com/highlight/highlight`,
			language: 'bash',
		},
	],
}

export const start: QuickStartStep = {
	title: 'Start highlight.',
	content:
		'In the `highlight/docker` directory, run `./run.sh` to start the docker containers.',
	code: [
		{
			text: `cd highlight/docker;
./run.sh;`,
			language: 'bash',
		},
	],
}

export const dashboard: QuickStartStep = {
	title: 'Visit the dashboard.',
	content: `Visit your REACT_APP_FRONTEND_URI to view the dashboard and go through the login flow; use the password set in docker/.env variable \`ADMIN_PASSWORD\` with any valid email address.`,
}

export const troubleshoot: QuickStartStep = {
	title: 'Troubleshoot the deployment.',
	content:
		"Having issues? Here's some things to try. First run the `docker ps` command and ensure that all containers are in a 'healthy' state. " +
		'As a second step, run `docker compose logs` to see the logs for the infra containers. ' +
		'Looking at the logs, if any containers are not healthy, use the follow commands to start from scratch. ' +
		"If this doesn't help with troubleshooting, please [reach out](https://highlight.io/community).",
	code: [
		{
			text: `docker ps
docker compose logs
# delete everything in the docker compose stack
docker compose down --remove-orphans --volumes --rmi local
`,
			language: 'bash',
		},
	],
}
