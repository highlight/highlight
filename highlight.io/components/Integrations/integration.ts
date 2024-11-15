export type Integration = {
	name: string
	description: string
	link: string
	image?: string
}

export const INTEGRATIONS: {
	[key: string]: Integration[]
} = {
	Analytics: [
		{
			name: 'Amplitude',
			description: 'Instrument highlight.io to send Amplitude events.',
			link: '/docs/general/integrations/amplitude-integration',
			image: '/images/companies/icons/amplitude.png',
		},
		{
			name: 'Pendo',
			description: 'Instrument highlight.io to send Pendo events.',
			link: '/docs/general/integrations/pendo-integration',
			image: '/images/companies/icons/pendo.png',
		},
		{
			name: 'Mixpanel',
			description: 'Instrument highlight.io to sent Mixpanel events.',
			link: '/docs/general/integrations/mixpanel-integration',
			image: '/images/companies/icons/mixpanel.png',
		},
		{
			name: 'Segment',
			description: 'Instrument highlight.io to send Segment events.',
			link: '/docs/general/integrations/segment-integration',
			image: '/images/companies/icons/segment.png',
		},
		{
			name: 'Grafana',
			description: 'Instrument highlight.io to send Grafana events.',
			link: '/docs/general/integrations/grafana-integration/overview#how-it-works',
			image: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Grafana_icon.svg',
		},
	],
	Messaging: [
		{
			name: 'Discord',
			description: 'Create Discord tickets within highlight.io.',
			link: '/docs/general/integrations/discord-integration',
			image: '/images/companies/icons/discord.png',
		},
		{
			name: 'Intercom',
			description:
				'Access highlight.io sessions within your Intercom dashboard.',
			link: '/docs/general/integrations/intercom-integration',
			image: '/images/companies/icons/intercom.png',
		},
		{
			name: 'Slack',
			description: 'Send alerts from highlight.io directly to Slack.',
			link: '/docs/general/integrations/slack-integration',
			image: '/images/companies/icons/slack.png',
		},
	],
	Platform: [
		{
			name: 'Vercel',
			description:
				'Automate the uploading of your sourcemaps and integrations.',
			link: '/docs/getting-started/backend-logging/hosting/vercel',
			image: '/images/companies/icons/vercel.png',
		},
		{
			name: 'AWS',
			description:
				'Stream Amazon Web Services application and infrastructure logs to highlight.io.',
			link: '/docs/getting-started/backend-logging/hosting/aws',
			image: '/images/companies/icons/aws.png',
		},
		{
			name: 'GCP',
			description:
				'Stream GCP application and infrastructure logs to highlight.io.',
			link: '/docs/getting-started/backend-logging/hosting/gcp',
			image: '/images/companies/icons/gcp.png',
		},
		{
			name: 'Azure',
			description:
				'Stream Microsoft Azure application and infrastructure logs to highlight.io.',
			link: '/docs/getting-started/backend-logging/hosting/azure',
			image: '/images/companies/icons/azure.png',
		},
		{
			name: 'Fly.io',
			description: 'Setup highlight.io log ingestion on Fly.io.',
			link: '/docs/getting-started/backend-logging/hosting/fly-io',
			image: '/images/companies/icons/flyio.png',
		},
		{
			name: 'Render',
			description: 'Setup highlight.io log ingestion on Render.',
			link: '/docs/getting-started/backend-logging/hosting/render',
			image: '/images/quickstart/render.png',
		},
	],
	Productivity: [
		{
			name: 'ClickUp',
			description: 'Create Clickup Tickets within highlight.io.',

			link: '/docs/general/integrations/clickup-integration',
			image: '/images/companies/icons/clickup.png',
		},
		{
			name: 'Height',
			description: 'Create Height tasks from within highlight.io.',
			link: '/docs/general/integrations/height-integration',
			image: '/images/companies/icons/height.png',
		},
		{
			name: 'GitHub',
			description: 'Create GitHub issues within highlight.io.',
			link: '/docs/general/integrations/github-integration',
			image: '/images/companies/icons/github.png',
		},
		{
			name: 'Jira',
			description: 'Create Jira issues within highlight.io.',
			link: '/docs/general/integrations/jira-integration',
			image: '/images/companies/icons/jira.png',
		},
	],
}
