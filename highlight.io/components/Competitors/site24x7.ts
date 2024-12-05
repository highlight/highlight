import site24x7full from '../../public/images/site24x7.svg'
import site24x7small from '../../public/images/site24x7-small.png'
import { Competitor } from './competitors'
import {
	HighlightIsOpenAndTransparent,
	HighlightShipsNewFeatures,
} from './shared-snippets'

export const Site24x7Spec: Competitor = {
	name: 'Site24x7',
	header: 'A Truly Open Source Site24x7 Alternative.',
	subheader:
		'Session replay of your frontend, fullstack error monitoring, and powerful logging.',
	logoDesktop: site24x7full,
	logoMobile: site24x7small,
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
					tooltip:
						'Create tickets with Linear, GitHub, Height, or ClickUp.',
					highlight: 1,
					competitor: 1,
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
					tooltip:
						'Create comments on sessions to tag folks on your team of issues.',
					highlight: 1,
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
					competitor: 0,
				},
				{
					feature: 'Embedded, fullstack error monitoring',
					highlight: 1,
					competitor: 1,
				},
				{
					feature: 'Canvas & WebGL Recording',
					tooltip:
						'Ability to record canvas and WebGl elements in your application.',
					highlight: 1,
					competitor: 0,
				},
				{
					feature: 'Shadow DOM Recording',
					tooltip:
						'Ability to record shadow DOM elements in your application.',
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
					feature: 'Error Sharing',
					highlight: 1,
					competitor: 1,
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
		HighlightIsOpenAndTransparent('Sentry'),
		HighlightShipsNewFeatures,
		{
			header: 'Full-stack Observability',
			body: 'While Site24x7 provides a comprehensive set of separate features for error monitoring, session replay, and logging, it does not have many session replay features such as Canvas & WebGL or Shadow DOM Recording. [Highlight.io](https://highlight.io) enables teams to monitor and optimize their entire tech stack, pairing server-side infrastructure with your frontend web applications. This makes Highlight.io a more comprehensive solution for developers who need to monitor their entire tech stack, in a simple, easy to implement solution.',
		},
	],
}
