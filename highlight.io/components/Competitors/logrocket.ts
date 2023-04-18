import logrocketlogofull from '../../public/images/logrocketlogofull.png'
import logrocketlogosmall from '../../public/images/logrocketlogosmall.png'
import { Competitor } from './competitors'

export const LogRocketSpec: Competitor = {
	name: 'LogRocket',
	header: 'The Open Source Logrocket Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	logoDesktop: logrocketlogofull,
	logoMobile: logrocketlogosmall,
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
				Lastly, the fact that [Highlight.io](https://highlight.io) is open source makes it easy to integrate and build your own tools on-top of it, an advantage closed-source products like LogRocket can\'t offer.
				`,
		},
		{
			header: 'Highlight.io constantly ships new features',
			body: "At Highlight.io, we ship quickly. We update our [changelog](https://www.highlight.io/docs/general/changelog/overview) with a recap of new features every two weeks, and we share when these features are completed in our [public roadmap](https://www.highlight.io/docs/general/roadmap). Plus, our community keeps pushing us to do more, so we're constantly adding new apps and integrations. We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
		},
		{
			header: 'We focus on cohesion, not just session replay',
			body: 'While LogRocket is mainly focused on session replay, Highlight.io provides a full-stack observability solution that encompasses session replay, logs, and error monitoring for both front-end and back-end applications. Along with recording user sessions, Highlight.io also captures logs and errors, providing developers with a comprehensive view of their entire stack. In contrast, LogRocket primarily focuses on session replay and product analytics, which can be more useful to product folks. With its more comprehensive approach, Highlight.io can help developers identify and resolve issues more efficiently and effectively.',
		},
	],
}
