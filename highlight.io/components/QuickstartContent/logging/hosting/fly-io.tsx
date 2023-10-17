import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingFlyIOLogContent: QuickStartContent = {
	title: 'Logging with the Fly.io Log Shipper',
	subtitle:
		'Learn how to setup Highlight log ingestion on [Fly.io](https://fly.io/blog/shipping-logs/). ' +
		'As a prerequisite, we assume you already have an application ' +
		'deployed on Fly.io and `flyctl` configured locally.',
	logoUrl: siteUrl('/images/quickstart/fly-io.svg'),
	entries: [
		{
			title: 'Configure and launch the fly.io logs shipper, configured for the highlight log drain.',
			content:
				'No other work is needed on the side of your application, ' +
				'as fly apps are already sending monitoring information ' +
				'back to fly which we can read. ' +
				'Check out the `README.md` for more details.',
			code: [
				{
					text: `# spin up the fly log shipper image
fly launch --image ghcr.io/superfly/fly-log-shipper:latest`,
					language: 'bash',
				},
				{
					text: `# set the org for your deployment
fly secrets set ORG=personal`,
					language: 'bash',
				},
				{
					text: `# give the logs shipper access to other containers' logs
fly secrets set ACCESS_TOKEN=$(fly auth token)`,
					language: 'bash',
				},
				{
					text: `# set to configure your highlight project. 
# this tells to log shipper to send data to highlight.
fly secrets set HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
