import { QuickStartContent } from '../QuickstartContent'
import { clone, dashboard, dependencies, troubleshoot } from './shared-snippets'

export const SelfHostContent: QuickStartContent = {
	title: 'Self-hosted (Hobby) Deployment',
	subtitle:
		'Learn how to set up the self-hosted hobby deployment of highlight.io.',
	entries: [
		dependencies,
		clone,
		{
			title: 'Configure networking.',
			content:
				'If this hobby deploy is running on a remote server, make changes to the `docker/.env` file for your deployment. ' +
				'Update the following values to your backend IP address.',
			code: [
				{
					text: `PRIVATE_GRAPH_URI=https://your-ip-address:8082/private
PUBLIC_GRAPH_URI=https://your-ip-address:8082/public
REACT_APP_PRIVATE_GRAPH_URI=https://your-ip-address:8082/private
REACT_APP_PUBLIC_GRAPH_URI=https://your-ip-address:8082/public
REACT_APP_FRONTEND_URI=https://your-ip-address:3000
`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Password auth mode.',
			content:
				'The frontend for hobby deploy now defaults to using password auth. That uses a password set in your deployments `docker/.env file to authenticate users`. ' +
				'Update the following environment variable to your preferred admin password. ',
			code: [
				{
					text: `ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD`,
					language: 'bash',
				},
			],
		},

		//
		{
			title: 'Start highlight.',
			content:
				'In the `highlight/docker` directory, run `./run-hobby.sh` to start the docker stack.',
			code: [
				{
					text: `cd highlight/docker;
./run-hobby.sh;`,
					language: 'bash',
				},
			],
		},
		dashboard,
		{
			title: 'Setup the snippet.',
			content:
				'In your frontend application, you should setup highlight.io as usual (see [our guides](https://highlight.io/docs/getting-started/overview#For-your-frontend)), with the exception of adding the `backendUrl` flag to your `init()` method. See the example in react to the right. ',
			code: [
				{
					text: `import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    backendUrl: 'https://localhost:8082/public',
    ...
});`,
					language: 'javascript',
				},
			],
		},
		troubleshoot,
	],
}
