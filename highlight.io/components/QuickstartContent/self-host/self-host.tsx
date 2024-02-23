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
				'Hosting the frontend on a different port is possible by modifying `docker/compose.hobby.yml` port forwarding. ' +
				'Update the following values to your backend IP address.',
			code: [
				{
					text: `REACT_APP_PRIVATE_GRAPH_URI=http://your-ip-address:8082/private
REACT_APP_PUBLIC_GRAPH_URI=http://your-ip-address:8082/public
REACT_APP_FRONTEND_URI=http://your-ip-address
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
		{
			title: 'Configure SSL (optional).',
			content:
				'By default, the stack deploys the frontend and backend over HTTP without SSL. If you need SSL, update the certificates in ' +
				'`backend/localhostssl` and set the `SSL` environment variable to `true` in `docker/.env`.',
			code: [
				{
					text: `# if you do not have a server.pem file, run the following command to convert the crt file to a pem.
openssl x509 -in server.crt -out server.pem -outform PEM`,
					language: 'bash',
				},
				{
					text: `# set the following environment variable in docker/.env
SSL=true`,
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
    backendUrl: 'http://localhost:8082/public',
    ...
});`,
					language: 'javascript',
				},
			],
		},
		troubleshoot,
	],
}
