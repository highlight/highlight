import { QuickStartContent } from '../QuickstartContent'
import { dependencies } from './shared-snippets'

export const DevDeploymentContent: QuickStartContent = {
	title: 'Developer Deployment',
	subtitle:
		'Learn how to set up the dev deployment of highlight.io to start contributing.',
	entries: [
		dependencies,
		{
			title: 'Clone the repository.',
			content:
				'Clone the [highlight.io](https://github.com/highlight/highlight) repository and make sure to checkout the submodules with the `--recurse-submodules` flag.',
			code: {
				text: `git clone --recurse-submodules https://github.com/highlight/highlight`,
				language: 'bash',
			},
		},
		{
			title: 'Enter the `highlight/docker` directory.',
			content:
				'Navigate into the `highlight/docker` directory of the repo.',
			code: {
				text: `cd highlight/docker`,
				language: 'bash',
			},
		},
		{
			title: 'Set the environment variable `COMPOSE_FILE` to support hot reloading.',
			content:
				'In the `highlight/docker` directory, set the environment variable `COMPOSE_FILE` as specified. This will enable hot reloading of both our backend and frontend.',
			code: {
				text: `export COMPOSE_FILE=compose.yml:compose.dev.yml`,
				language: 'bash',
			},
		},
		{
			title: 'Start the docker compose containers.',
			content:
				'In the `highlight/docker` directory, run `./run.sh` to start the docker containers.',
			code: {
				text: `./run.sh`,
				language: 'bash',
			},
		},
		{
			title: 'Visit the dashboard.',
			content:
				'Visit https://localhost:3000 to view the dashboard and go through the login flow; there are no login credentials required.',
		},
		{
			title: 'View your first session.',
			content:
				'After clicking around on the dashboard for a bit, you should see a session appear at https://localhost:3000/1/sessions. Click on the session to view the session details page.',
		},
		{
			title: 'Troubleshoot the deployment.',
			content:
				"Having issues? Here's some things ot try. First run the `docker ps` command and ensure that all containers are in a 'healthy' state. As a second step, run `docker compose logs` to see the logs for the infra containers. If this doesn't help w/ troubleshooting, please [reach out](https://highlight.io/community).",
			code: {
				text: `docker ps
docker compose logs`,
				language: 'bash',
			},
		},
	],
}
