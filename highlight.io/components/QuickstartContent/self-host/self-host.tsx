import { QuickStartContent } from '../QuickstartContent'
import { clone, dashboard, dependencies, start } from './shared-snippets'

export const SelfHostContent: QuickStartContent = {
	title: 'Self-hosted (Hobby) Deployment',
	subtitle:
		'Learn how to set up the self-hosted hobby deployment of highlight.io.',
	entries: [
		dependencies,
		clone,
		start,
		dashboard,
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
