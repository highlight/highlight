import { Competitor } from './competitors'

export const SmartlookSpec: Competitor = {
	name: 'Smartlook',
	header: 'The Open Source Smartlook Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	type: 'error-monitoring',
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
					feature: 'Self-serve',
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
		{
			header: 'Highlight.io is open source and transparent',
			body: `[Highlight.io](https://highlight.io) is built with transparency at its core. Not only do we work in the open and give full access to [our source code](https://github.com/highlight/highlight). Highlight.io’s open app framework makes it easy to integrate internal tools, an advantage closed-source products like Smartlook can't offer.`,
		},
		{
			header: 'Highlight.io constantly ships new features',
			body: "At [Highlight.io](https://highlight.io), we ship quickly. Our [changelog](https://www.highlight.io/docs/general/changelog/overview) is updated every week and we're constantly working on beta testing for even more updates. Plus, our community of developers keeps pushing us to do more, so we're constantly adding new SDKs and integrations ([see our roadmap](https://www.highlight.io/docs/general/roadmap)). We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
		},
		{
			header: 'Engineer vs Marketer',
			body: 'Highlight and Smartlook are two different products with different target audiences. While Highlight is a full-stack observability solution designed for engineers, Smartlook is a tool that offers features such as heatmaps and user feedback to help marketers understand user behavior and optimize conversion rates. While both tools may offer some overlapping features such as session replay, Highlight is focused on providing deeper insights for engineers by capturing system logs and tracking errors across the entire stack. In contrast, Smartlook’s features are geared toward helping marketers optimize their websites and increase conversions.',
		},
		{
			header: 'Full-stack Observability',
			body: 'Smartlook is primarily focused on providing session replay and heatmaps for marketers to gain insights into user behavior and optimize their websites for conversions. However, it has limited monitoring capabilities compared to Highlight.io, which is a full-stack observability tool designed for engineers. Highlight.io offers session replay, error monitoring, and log analysis capabilities that provide a comprehensive view of both front-end and back-end activities, allowing developers to quickly identify and diagnose issues across their entire stack. With its in-depth monitoring capabilities, Highlight.io can help developers improve the overall performance and reliability of their applications.',
		},
		{
			header: 'Did someone say free?',
			body: `Smartlook offers a free plan that allows users to record up to 3000 sessions per month, with access to all features including heatmap analysis and form analysis views. Their paid plans start at $55 per month and offer additional features such as event tracking, custom data properties, and integrations with third-party tools. Pricing for larger organizations is available upon request. \\
            Highlight offers a free plan that includes 500 sessions and 1,000 errors per month, with unlimited seats for all plans including the free version. Depending on your project's specific usage needs and budget, choosing between Highlight and Smartlook for their respective free trials may be necessary.
            `,
		},
	],
}
