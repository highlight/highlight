import { Competitor } from './competitors'
import {
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const FullstorySpec: Competitor = {
	name: 'Fullstory',
	header: 'The Open Source Fullstory Alternative.',
	subheader:
		'Pixel-perfect video replay of your frontend web application. Step into the shoes of your users.',
	sections: [
		{
			title: 'General',
			rows: [
				{
					feature: 'Unlimited Team Members',
					tooltip: 'Fullstory limits team members on paid plans.',
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
		HighlightIsOpenAndTransparent('Fullstory'),
		HighlightShipsNewFeatures,
		{
			header: 'Experience Insights vs Errors & Regressions',
			body: 'Fullstory is designed to provide insights into both product and customer experience, with features such as session replay, heatmaps, and conversion funnels. This makes it an ideal tool for product and customer experience teams looking to understand how users interact with their website or application. In contrast, Highlight is primarily geared towards developers, with features such as error tracking, log search, and code-level visibility.',
		},
		{
			header: 'We focus on cohesion, not just session replay',
			body: 'While Fullstory is mainly focused on session replay, Highlight.io provides a **full-stack** solution that encompasses session replay, logs, and error monitoring. Given that Highlight.io also captures logs and errors, developers get a comprehensive view of their entire stack. In contrast, Fullstory primarily focuses on experience insight and funnels, which can be more useful to product and marketing teams.',
		},
		{
			header: 'Pricing',
			body: `Fullstory does not provide a free trial. Instead, they offer custom pricing plans tailored to the specific needs of each organization, and users are encouraged to connect with their sales team. At Highlight.io, we are fundamentally against requiring a sales person to block you from using our product. Users can start for free and get their first 500 sessions and 1,000 errors per month for free. The tool also provides unlimited seats for all plans, including the free plan.`,
		},
	],
}
