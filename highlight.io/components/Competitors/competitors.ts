import { StaticImageData } from 'next/image'

export type ComparisonTableRow = {
	feature: string
	highlight: 0 | 0.5 | 1
	competitor: 0 | 1
	tooltip?: string
}

export type ComparisonTableSection = {
	title: string
	rows: ComparisonTableRow[]
}

export type Competitor = {
	slug: string
	name: string
	header: string
	subheader: string
	subHeader2: string
	logo?: StaticImageData
	sections: ComparisonTableSection[]
	paragraphs?: {
		header: string
		//Body is markdown so it can include links and styling
		body: string
	}[]
}

export const COMPETITORS: { [k: string]: Competitor } = {
	logrocket: {
		slug: 'highlight-vs-logrocket',
		name: 'LogRocket',
		header: 'The Open Source Logrocket Alternative.',
		subheader:
			'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
		subHeader2:
			'An Open Source, Fullstack Alternative to Logrocket. Get Started for free in minutes.',
		sections: [
			{
				title: 'General',
				rows: [
					{
						feature: 'Unlimited Team Members',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Unlimited Team Members',
						highlight: 1,
						competitor: 0,
					},
					{
						feature: 'Unlimited Team Members',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Unlimited Team Members',
						highlight: 0.5,
						competitor: 1,
					},
					{
						feature: 'Unlimited Team Members',
						highlight: 1,
						competitor: 1,
					},
				],
			},
			{
				title: 'Session Replay',
				rows: [
					{
						feature: 'Commenting / Mentions',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Heatmaps',
						highlight: 1,
						competitor: 0,
					},
					{
						feature: 'Session Sharing',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Privacy SDKs',
						highlight: 0.5,
						competitor: 0,
					},
					{
						feature: 'Embedded Error Monitoring',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Canvas & WebGL Recording',
						highlight: 1,
						competitor: 1,
					},
					{
						feature: 'Session-level Debugging Data',
						highlight: 1,
						competitor: 1,
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
				Not only do we work in the open and give full access to [our source code](https://github.com/highlight/highlight), but we also expose what we\'re working on openly on [our roadmap](https://www.highlight.io/docs/general/roadmap).
				Lastly, the fact that [Highlight.io](https://highlight.io) is an open source makes it easy to integrate internal tools, an advantage closed-source products like LogRocket can\'t offer.
				`,
			},
			{
				header: 'Highlight.io constantly ships new features',
				body: "At Highlight.io, we ship quickly. We update our [changelog](https://www.highlight.io/docs/general/changelog/overview) with a recap of new features every two weeks, and we share when these features are completed in our [public roadmap](https://www.highlight.io/docs/general/roadmap). Plus, our community of developers keeps pushing us to do more, so we're constantly adding new apps and integrations. We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
			},
			{
				header: 'We focus on Cohesion, not just Session Replay',
				body: 'While LogRocket is mainly focused on session replay, Highlight.io provides a full-stack observability solution that encompasses session replay, logs, and error monitoring for both front-end and back-end applications. Along with recording user sessions, Highlight.io also captures system logs and errors, providing developers with a comprehensive view of their entire stack. In contrast, LogRocket primarily focuses on session replay, which can be lacking depth-wise compared to Highlight.io. With its more comprehensive approach, Highlight.io can help developers identify and resolve issues more efficiently and effectively.',
			},
		],
	},
}
