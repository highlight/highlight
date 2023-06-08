export type Integration = {
	name: string
	description: string
	link: string
}

export const INTEGRATIONS: {
	[key: string]: Integration[]
} = {
	'Category 1': [
		{
			name: 'Amplitude',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/amplitude-integration',
		},
		{
			name: 'ClickUp',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',

			link: '/docs/general/integrations/clickup-integration',
		},
		{
			name: 'Discord',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/discord-integration',
		},
		{
			name: 'Electron',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/electron-integration',
		},
		{
			name: 'Front',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/front-integration',
		},
	],
	'Category 2': [
		{
			name: 'GitHub',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/github-integration',
		},
		{
			name: 'Height',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/height-integration',
		},
		{
			name: 'Intercom',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/intercom-integration',
		},
		{
			name: 'Mixpanel',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/mixpanel-integration',
		},
		{
			name: 'Segment',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/segment-integration',
		},
		{
			name: 'Slack',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/slack-integration',
		},
		{
			name: 'Vercel',
			description:
				'This is some text explaining what this company does. This is some text explaining what this company does. ',
			link: '/docs/general/integrations/vercel-integration',
		},
	],
}
