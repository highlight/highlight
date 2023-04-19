import { Competitor } from './competitors'

export const InspectletSpec: Competitor = {
	name: 'Inspectlet',
	header: 'The Open Source Inspectlet Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	type: 'logging',
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
			body: `[Highlight.io](https://highlight.io) is built with transparency at its core. Not only do we work in the open and give full access to [our source code](https://github.com/highlight/highlight), we also enable [integrations](https://www.highlight.io/docs/general/integrations/overview), open our own PRs, or give feedback on [our roadmap](https://www.highlight.io/docs/general/roadmap). Highlight.io’s open app framework makes it easy to integrate internal tools, an advantage closed-source products like Inspectlet can't offer.`,
		},
		{
			header: 'Highlight.io constantly ships new features',
			body: 'At [Highlight.io](https://highlight.io), we ship quickly. We update [our changelog](https://www.highlight.io/docs/general/changelog/overview) with a recap of new features every two weeks, and we share when these features are completed in [our public roadmap](https://www.highlight.io/docs/general/roadmap). Plus, our community of developers keeps pushing us to do more, so we’re constantly adding new apps and integrations. We work hard to keep Highlight.io ahead of the curve, and we’re not afraid to show off our secret sauce.',
		},
		{
			header: 'Engineer vs Marketer',
			body: 'Highlight and Inspectlet are two different products with different target audiences. While Highlight is a full-stack observability solution designed for engineers, Inspectlet is a tool that offers features such as heatmaps and user feedback to help marketers understand user behavior and optimize conversion rates. While both tools may offer some overlapping features such as session replay, Highlight is focused on providing deeper insights for engineers by capturing system logs and tracking errors across the entire stack. In contrast, Inspectlet’s features are geared toward helping marketers optimize their websites and increase conversions.',
		},
		{
			header: 'Full-stack Observability',
			body: 'While Fullstory provides a comprehensive set of features for front-end analytics, it does not support full-stack observability. [Highlight.io](https://highlight.io) enables teams to monitor and optimize their entire tech stack, including server-side infrastructure and third-party services. This makes Highlight.io a more comprehensive solution for developers who need to monitor their entire tech stack, not just front-end user behavior.',
		},
		{
			header: 'Did someone say free?',
			body: `Inspectlet offers a free plan that enables users to record up to 2500 sessions per month with access to core features such as session recording, heatmaps, and form analytics. Their paid plans start at $39 per month and include additional features such as funnel analysis, conversion tracking, and error reporting. \\
            Highlight offers a free plan that includes 500 sessions and 1,000 errors per month, with unlimited seats for all plans including the free version. Depending on your project's specific usage needs and budget, choosing between Highlight and Inspectlet for their respective free trials may be necessary.
            `,
		},
	],
}
