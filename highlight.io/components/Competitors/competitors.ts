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
	competitorInfo: string
	highlightInfo: string
	logo?: StaticImageData
	sections: ComparisonTableSection[]
}

export const COMPETITORS: { [k: string]: Competitor } = {
	'log-rocket': {
		slug: 'log-rocket',
		name: 'LogRocket',
		header: 'The Open Source Logrocket Alternative.',
		subheader:
			'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
		subHeader2:
			'An Open Source, Fullstack Alternative to Logrocket. Get Started for free in minutes.',
		competitorInfo:
			'LogRocket is a popular frontend error monitoring and session replay tool. It is a great tool for frontend developers, but it does not offer a fullstack solution.',
		highlightInfo:
			'Highlight is an open source, fullstack alternative to LogRocket. It is a great tool for frontend developers, and it DOES offer a fullstack solution.',
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
	},
}
