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
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/amplitude-integration',
			image: '/images/companies/icons/amplitude.png',
		},
		{
			name: 'Mixpanel',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/mixpanel-integration',
			image: '/images/companies/icons/mixpanel.png',
		},
		{
			name: 'Segment',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/segment-integration',
			image: '/images/companies/icons/segment.png',
		},
	],
	Messaging: [
		{
			name: 'Discord',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/discord-integration',
			image: '/images/companies/icons/discord.png',
		},
		{
			name: 'Front',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/front-integration',
			image: '/images/companies/icons/front.png',
		},

		{
			name: 'Intercom',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/intercom-integration',
			image: '/images/companies/icons/intercom.png',
		},
		{
			name: 'Slack',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/slack-integration',
			image: '/images/companies/icons/slack.png',
		},
	],
	Platform: [
		{
			name: 'Vercel',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/getting-started/backend-logging/hosting/vercel',
			image: '/images/companies/icons/vercel.png',
		},
		{
			name: 'AWS',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/getting-started/backend-logging/hosting/aws',
			image: '/images/companies/icons/aws.png',
		},
		{
			name: 'GCP',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/getting-started/backend-logging/hosting/gcp',
			image: '/images/companies/icons/gcp.png',
		},
		{
			name: 'Fly.io',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/getting-started/backend-logging/hosting/fly-io',
			image: '/images/companies/icons/flyio.png',
		},
	],
	Productivity: [
		{
			name: 'ClickUp',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',

			link: '/docs/general/integrations/clickup-integration',
			image: '/images/companies/icons/clickup.png',
		},
		{
			name: 'Height',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/height-integration',
			image: '/images/companies/icons/height.png',
		},
		{
			name: 'GitHub',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/github-integration',
			image: '/images/companies/icons/github.png',
		},
	],
}
