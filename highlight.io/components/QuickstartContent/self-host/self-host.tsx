import { QuickStartContent } from '../QuickstartContent'
import { dependencies } from './shared-snippets'

export const SelfHostContent: QuickStartContent = {
	title: 'Self-hosted (Hobby) Deployment',
	subtitle:
		'Learn how to set up the self-hosted hobby deployment of highlight.io.',
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
				'Visit https://localhost:3000 to view the dashboard; there are no login credentials required.',
		},
		{
			title: 'Setup the snippet.',
			content:
				'In your frontend application, you should setup highlight.io as usual (see [our guides](https://highlight.io/docs/getting-started/overview#For-your-frontend)), with the exception of adding the `backendUrl` flag to your `init()` method. See the example in react to the right. ',
			code: {
				text: `import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    backendUrl: 'https://localhost:8082/public',
    ...
});`,
				language: 'javascript',
			},
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
