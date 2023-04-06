import { siteUrl } from '../../../utils/urls'
import { QuickStartStep } from '../QuickstartContent'

export const dependencies: QuickStartStep = {
	title: 'Prerequisites',
	content:
		'Before we get started, you should install [Go](https://go.dev/) (1.19) and [Node.js](https://nodejs.org/en) (16).' +
		'You should have the latest version of [Docker](https://docs.docker.com/engine/install/) (19.03.0+) ' +
		'and [Git](https://git-scm.com/downloads) (2.13+) installed. ' +
		'For a local deploy, we suggest [configuring docker](https://docs.docker.com/desktop/settings/mac/#resources) ' +
		'to use at least 6GB of memory, 2 CPUs, and 64 GB of disk space.',
	code: {
		language: 'bash',
		text: `$ go version
go version go1.19.3 darwin/arm64
$ node --version
v16.15.0`,
	},
}

export const clone: QuickStartStep = {
	title: 'Clone the repository.',
	content:
		'Clone the [highlight.io](https://github.com/highlight/highlight) repository and make sure to checkout the submodules with the `--recurse-submodules` flag.',
	code: {
		text: `git clone --recurse-submodules https://github.com/highlight/highlight`,
		language: 'bash',
	},
}

export const start: QuickStartStep = {
	title: 'Start highlight.',
	content:
		'In the `highlight/docker` directory, run `./run.sh` to start the docker containers.',
	code: {
		text: `cd highlight/docker;
./run.sh;`,
		language: 'bash',
	},
}

export const dashboard: QuickStartStep = {
	title: 'Visit the dashboard.',
	content:
		'Visit https://localhost:3000 to view the dashboard and go through the login flow; there are no login credentials required.',
}

export const troubleshoot: QuickStartStep = {
	title: 'Troubleshoot the deployment.',
	content:
		"Having issues? Here's some things ot try. First run the `docker ps` command and ensure that all containers are in a 'healthy' state. " +
		'As a second step, run `docker compose logs` to see the logs for the infra containers. ' +
		'Looking at the logs, if any containers are not healthy, use the follow commands to start from scratch. ' +
		"If this doesn't help w/ troubleshooting, please [reach out](https://highlight.io/community).",
	code: {
		text: `docker ps
docker compose logs
# delete everything in the docker compose stack
docker compose down --remove-orphans --volumes --rmi local
`,
		language: 'bash',
	},
}
