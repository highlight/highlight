import { Competitor } from './competitors'

export const HotjarSpec: Competitor = {
	name: 'Hotjar',
	header: 'The Open Source Hotjar Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	type: 'session-replay',
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
			body: `
				[Highlight.io](https://highlight.io) is built with transparency at its core. 
				Not only do we work in the open, but we also expose what we\'re working on openly on [our roadmap](https://www.highlight.io/docs/general/roadmap).
				Lastly, the fact that [Highlight.io](https://highlight.io) is open source makes it easy to integrate internal tools, an advantage closed-source products like LogRocket can't offer. 
				`,
		},
		{
			header: 'Highlight.io constantly ships new features',
			body: "At Highlight.io, we ship quickly. We update our [changelog](https://www.highlight.io/docs/general/changelog/overview) with a recap of new features every two weeks, and we share when these features are completed in our [public roadmap](https://www.highlight.io/docs/general/roadmap). Plus, our community keeps pushing us to do more, so we're constantly adding new apps and integrations. We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
		},
		{
			header: 'Engineer vs Marketer',
			body: "Highlight and Hotjar are two different products with different target audiences. While Highlight is a full-stack observability solution designed for engineers, Hotjar is a tool that offers features such as heatmaps and user feedback to help marketers understand user behavior and optimize conversion rates. While both tools may offer some overlapping features such as session replay, Highlight is focused on providing deeper insights for engineers by capturing logs and tracking errors across the entire stack. In contrast, Hotjar's features are geared toward helping marketers optimize their websites and increase conversions.",
		},
		{
			header: 'We focus on cohesion, not just session replay',
			body: 'While Hotjar is mainly focused on session replay, Highlight.io provides a full-stack observability solution that encompasses session replay, logs, and error monitoring for both front-end and back-end applications. Along with recording user sessions, Highlight.io also captures logs and errors, providing developers with a comprehensive view of their entire stack. In contrast, Hotjar primarily focuses on session replay and product analytics, which can be more useful to product folks. With its more comprehensive approach, Highlight.io can help developers identify and resolve issues more efficiently and effectively.',
		},
		{
			header: 'Did someone say free?',
			body: `Hotjar provides a limited free plan that allows you to record up to 35 daily sessions per month with access to only 20 form analysis views. \\
             With Highlight, users can start for free and get their first 500 sessions and 1,000 errors per month for free. The tool also provides unlimited seats for all plans, including the free plan. The choice between Hotjar and Highlight for free trials will depend on the specific usage needs and budget of your project.
            `,
		},
	],
}
