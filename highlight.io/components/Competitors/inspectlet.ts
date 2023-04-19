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
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Self-hosted Options',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Analytics Integrations',
					highlight: 1,
					competitor: 1,
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
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Shadow DOM Recording',
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
					feature: 'Support for Backend SDKs',
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
