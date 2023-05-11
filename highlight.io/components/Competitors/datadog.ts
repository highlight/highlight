import datadogsmall from '../../public/images/datadog-small.png'
import datadogfull from '../../public/images/datadog.png'
import { Competitor } from './competitors'
import {
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const DatadogSpec: Competitor = {
	name: 'Datadog',
	header: 'The Open Source Datadog Alternative.',
	subheader:
		'Session replay of your frontend, fullstack error monitoring, and powerful logging.',
	logoDesktop: datadogfull,
	logoMobile: datadogsmall,
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
					competitor: 0,
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
					competitor: 0,
				},
				{
					feature: 'Session Sharing',
					tooltip:
						'Ability to share sessions across your team and with customers.',
					highlight: 1,
					competitor: 0,
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
					competitor: 0,
				},
				{
					feature: 'Error Sharing',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Support for Backend SDKs',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Agent-less architecture',
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
					competitor: 1,
				},
				{
					feature: 'Backend logging',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Embedded replay and stacktraces',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Agent-less architecture',
					highlight: 1,
					competitor: 0,
				},
			],
		},
	],
	paragraphs: [
		HighlightIsOpenAndTransparent('Datadog'),
		HighlightShipsNewFeatures,
		{
			header: 'Full-stack Observability',
			body: 'While Datadog provides a comprehensive set of separate features for observability, it does not support full-stack observability. [Highlight.io](https://highlight.io) enables teams to monitor and optimize their entire tech stack, pairing server-side infrastructure with your frontend web application. This makes Highlight.io a more comprehensive solution for developers who need to monitor their entire tech stack, in a simple, easy to implement solution.',
		},
		{
			header: 'Pricing',
			body: `Datadog's pricing structure is based on the number of hosts you have, the amount of data you ingest, and the amount of data you retain. This can make it difficult to predict your monthly bill. Highlight.io's pricing is based entirely on your usage with a straightforward retention multiplier, and you can find more details on our [pricing page](https://highlight.io/pricing).
            `,
		},
		{
			header: 'Agent-less Architecture',
			body: `Datadog's architecture requires you to install an agent on your server. This can be a pain to install and maintain. Highlight.io's architecture is agent-less and requires no installation, but in the case that you want to install an agent long-term, we have an open-source agent/collector that you can install on your servers.`,
		},
	],
}
