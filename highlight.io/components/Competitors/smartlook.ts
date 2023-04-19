import { Competitor } from './competitors'
import {
	EngineersVsMarketers,
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const SmartlookSpec: Competitor = {
	name: 'Smartlook',
	header: 'The Open Source Smartlook Alternative.',
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
		HighlightIsOpenAndTransparent('Smartlook'),
		HighlightShipsNewFeatures,
		EngineersVsMarketers('Smartlook'),
		{
			header: 'Full-stack Monitoring',
			body: 'Smartlook is primarily focused on providing session replay and analytics for product folks to gain insights into user behavior and optimize their websites for conversions. However, it has limited monitoring capabilities compared to Highlight.io, which is a full-stack tool designed for engineers. Highlight.io offers session replay, error monitoring, and log analysis, allowing developers to quickly identify and diagnose issues across their entire stack. With its in-depth monitoring capabilities, Highlight.io can help developers improve the overall performance and reliability of their applications.',
		},
		{
			header: 'Pricing',
			body: `Smartlook offers a free plan that allows users to record up to 3000 sessions per month, with access to all features including heatmap analysis and form analysis views. Their paid plans start at $55 per month and offer additional features such as event tracking, custom data properties, and integrations with third-party tools. Pricing for larger organizations is available upon request. \\
            Highlight offers a free plan that includes 500 sessions and 1,000 errors per month, with unlimited seats for all plans including the free version.'
            `,
		},
	],
}
