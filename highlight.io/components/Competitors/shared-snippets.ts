import { CompetitorPara } from './competitors'

export const HighlightIsOpenAndTransparent = (name: string): CompetitorPara => {
	return {
		header: 'Highlight.io is open source and transparent',
		body: `
				[Highlight.io](https://highlight.io) is built with transparency at its core, with a [permissive license](https://github.com/highlight/highlight/blob/main/LICENSE). 
				Not only do we work in the open, but we also expose what we\'re working on, on [our roadmap](https://www.highlight.io/docs/general/roadmap).
				The fact that [Highlight.io](https://highlight.io) is open source also makes it easy to integrate and build your own tools on-top of it, an advantage closed-source products like ${name} can\'t offer.
				`,
	}
}

export const HighlightShipsNewFeatures: CompetitorPara = {
	header: 'Highlight.io constantly ships new features',
	body: "At Highlight.io, we ship quickly. We update our [changelog](https://www.highlight.io/docs/general/changelog/overview) with a recap of new features biweekly, and we share when these features are completed in our [public roadmap](https://www.highlight.io/docs/general/roadmap). Plus, our community keeps pushing us to do more, so we're constantly adding new [integrations](https://www.highlight.io/docs/general/integrations). We work hard to keep Highlight.io ahead of the curve, and we're not afraid to show off our secret sauce.",
}

export const EngineersVsMarketers = (name: string): CompetitorPara => {
	return {
		header: 'Engineers vs Marketers',
		body: `Highlight and ${name} have two very different target audiences. While Highlight is a full-stack monitoring solution designed for monitoring web applications, ${name} is a tool that offers features such as heatmaps and user feedback to help marketers optimize conversion rates for their landing pages. While both tools may offer some overlapping features such as session replay, Highlight is focused on providing monitoring and error-tracking for engineers and product teams, not marketers.`,
	}
}
