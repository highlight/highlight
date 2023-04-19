import inspectletlogofull from '../../public/images/inspectletlogofull.png'
import inspectletlogosmall from '../../public/images/inspectletlogosmall.png'
import { Competitor } from './competitors'
import {
	EngineersVsMarketers,
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const InspectletSpec: Competitor = {
	name: 'Inspectlet',
	header: 'The Open Source Inspectlet Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	logoDesktop: inspectletlogofull,
	logoMobile: inspectletlogosmall,
	sections: [
		{
			title: 'General',
			rows: [
				{
					feature: 'Unlimited Team Members',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Support Ticket Integrations',
					tooltip: 'Create tickets with clickup, linear, or jira.',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Self-hosted Options',
					tooltip:
						'Self-hosted options are available for highlight.io',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Analytics Integrations',
					tooltip: 'Integrations with mixpanel, amplitude, etc..',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Self-serve Setup',
					highlight: 1,
					competitor: 1,
				},
			],
		},
		{
			title: 'Session Replay',
			rows: [
				{
					feature: 'Session Commenting',
					tooltip:
						'Create comments on sessions to tag folks on your team of issues.',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Heatmaps',
					highlight: 0,
					competitor: 1,
				},
				{
					feature: 'Session Sharing',
					tooltip:
						'Ability to share sessions across your team and with customers.',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Privacy SDKs',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Embedded, fullstack error monitoring',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Canvas & WebGL Recording',
					tooltip:
						'Ability to record canvas and webgl elements in your application.',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Shadow DOM Recording',
					tooltip:
						'Ability to record shadow dom elements in your application.',
					highlight: 1,
					competitor: 0,
				},
			],
		},
		{
			title: 'Error Monitoring',
			rows: [
				{
					feature: 'Embedded Session Replay',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Error Sharing',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Support for Backend SDKs',
					highlight: 1,
					competitor: 0,
				},
			],
		},
		{
			title: 'Logging',
			rows: [
				{
					feature: 'Frontend logging',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Backend logging',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Embedded replay and stacktraces',
					highlight: 1,
					competitor: 0,
				},
			],
		},
	],
	paragraphs: [
		HighlightIsOpenAndTransparent('Inspectlet'),
		HighlightShipsNewFeatures,
		EngineersVsMarketers('Inspectlet'),
		{
			header: 'Full-stack Observability',
			body: 'While Fullstory provides a comprehensive set of features for front-end analytics, it does not support full-stack observability. [Highlight.io](https://highlight.io) enables teams to monitor and optimize their entire tech stack, including server-side infrastructure and third-party services. This makes Highlight.io a more comprehensive solution for developers who need to monitor their entire tech stack, not just front-end user behavior.',
		},
		{
			header: 'Pricing',
			body: `Inspectlet offers a free plan that enables users to record up to 2500 sessions per month with access to core features such as session recording, heatmaps, and form analytics. Their paid plans start at $39 per month and include additional features such as funnel analysis, conversion tracking, and error reporting. \\
            Highlight offers a free plan that includes 500 sessions and 1,000 errors per month, with unlimited seats for all plans including the free version.
            `,
		},
	],
}
