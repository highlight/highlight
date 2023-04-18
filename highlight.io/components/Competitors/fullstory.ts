import { Competitor } from './competitors'

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
				Lastly, the fact that [Highlight.io](https://highlight.io) is open source makes it easy to integrate internal tools, an advantage closed-source products like Fullstory can't offer. 
				`,
		},
		{
			header: 'Highlight.io constantly ships new features',
			body: "At Highlight.io, we ship quickly. Our changelog is updated every week and we're constantly working on beta testing for even more updates. Plus, our community of developers keeps pushing us to do more, so we're constantly adding new SDKs and integrations ([see our roadmap](https://www.highlight.io/docs/general/roadmap)). We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
		},
		{
			header: 'Experience vs Bugs',
			body: "Fullstory is designed to provide insights into both product and customer experience, with features such as session replay, heatmaps, and conversion funnels. This makes it an ideal tool for product and customer experience teams looking to understand how users interact with their website or application. In contrast, Highlight is primarily geared towards developers, with features such as error tracking, log search, and code-level visibility. This focus on debugging and troubleshooting makes it an excellent tool for developers looking to identify and resolve issues quickly. While both tools offer session replay, Fullstory's focus on user experience and analytics sets it apart from Highlight's focus on debugging and troubleshooting.",
		},
		{
			header: 'Full-stack Observability',
			body: 'While Fullstory provides a comprehensive set of features for front-end analytics, it does not support full-stack observability. [Highlight.io](https://highlight.io) enables teams to monitor and optimize their entire tech stack, including server-side infrastructure and third-party services. This makes Highlight.io a more comprehensive solution for developers who need to monitor their entire tech stack, not just front-end user behavior.',
		},
		{
			header: 'Did someone say free?',
			body: `Fullstory does not provide a free trial option. Instead, they offer custom pricing plans tailored to the specific needs of each organization, and interested users are encouraged to connect with their sales team for more information. \\
            With Highlight, users can start for free and get their first 500 sessions and 1,000 errors per month for free. The tool also provides unlimited seats for all plans, including the free plan. The choice between Fullstory and Highlight for free trials will depend on the specific usage needs and budget of your project.`,
		},
	],
}
