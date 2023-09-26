import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingRenderLogContent: QuickStartContent = {
	title: 'Logging with Render',
	subtitle:
		'Learn how to setup Highlight log ingestion on Render as a log stream. ' +
		'As a prerequisite, we assume you already have an application ' +
		'deployed on Render.',
	logoUrl: siteUrl('/images/quickstart/render.png'),
	entries: [
		{
			title: 'Visit your Render settings and find the Log Streams tab.',
			content:
				'Visit your [Dashboard](https://dashboard.render.com), then click `Settings` ' +
				'under your account dropdown in the top right corner. ' +
				'Then click the `Log Streams` tab on the left.',
		},
		{
			title: 'Click Add Log Stream and configure the endpoint.',
			content:
				'Enter `syslog.highlight.io:34302` for the [Log Stream](https://render.com/docs/log-streams) endpoint and your [highlight project ID](https://app.highlight.io/setup) for the token.',
		},
		verifyLogs,
	],
}
