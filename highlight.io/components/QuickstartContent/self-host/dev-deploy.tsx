import { QuickStartContent } from '../QuickstartContent'
import {
	clone,
	dashboard,
	dependencies,
	start,
	troubleshoot,
} from './shared-snippets'

export const DevDeploymentContent: QuickStartContent = {
	title: 'Developer Deployment',
	subtitle:
		'Learn how to set up the dev deployment of highlight.io to start contributing.',
	entries: [
		dependencies,
		clone,
		start,
		{
			title: '(Optional) Running in different terminals.',
			content:
				'While the above instructions will hot-reload, you might want more control of parts of the stack when developing. ' +
				'Running the dev workflow manually is easy in different terminals as well.',
			code: [
				{
					key: 'infra',
					text: `# first, start the infrastructure containers
cd highlight/docker;
./start-infra.sh;`,
					language: 'bash',
				},
				{
					key: 'backend',
					text: `# start the backend. this will run make start-no-doppler in backend and block until you stop it with ctrl+c.
cd highlight/docker;
./run-backend.sh`,
					language: 'bash',
				},
				{
					key: 'frontend',
					text: `# now, start the frontend in a second terminal. this will run yarn docker:frontend in the monorepo and block until you stop it with ctrl+c.
./run-frontend.sh`,
					language: 'bash',
				},
			],
		},
		dashboard,
		{
			title: 'View your first session.',
			content:
				'After clicking around on the dashboard for a bit, you should see a session appear at http://localhost:3000/1/sessions. Click on the session to view the session details page.',
		},
		troubleshoot,
	],
}
