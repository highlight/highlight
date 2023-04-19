import smartlooklogofull from '../../public/images/smartlooklogofull.png'
import smartlooklogosmall from '../../public/images/smartlooklogosmall.png'
import { Competitor } from './competitors'
import {
	EngineersVsMarketers,
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const SmartlookSpec: Competitor = {
	name: 'Smartlook',
	header: 'The Open Source Smartlook Alternative.',
	logoDesktop: smartlooklogofull,
	logoMobile: smartlooklogosmall,
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
