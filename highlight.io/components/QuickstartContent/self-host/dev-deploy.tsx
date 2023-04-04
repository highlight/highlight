import { QuickStartContent } from '../QuickstartContent'
import { clone, dashboard, dependencies, start } from './shared-snippets'

export const DevDeploymentContent: QuickStartContent = {
	title: 'Developer Deployment',
	subtitle:
		'Learn how to set up the dev deployment of highlight.io to start contributing.',
	entries: [
		dependencies,
		clone,
		start,
		dashboard,
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
