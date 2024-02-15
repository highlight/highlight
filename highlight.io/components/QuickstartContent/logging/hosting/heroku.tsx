import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingHerokuLogContent: QuickStartContent = {
	title: 'Logging with Heroku',
	subtitle:
		'Learn how to setup Highlight log ingestion on Heroku as a log stream. ' +
		'As a prerequisite, we assume you already have an application ' +
		'deployed on Heroku.',
	logoUrl: siteUrl('/images/quickstart/Heroku.png'),
	entries: [
		{
			title: 'Add a Syslog Log Drain to your heroku app.',
			code: [
				{
					language: 'bash',
					text: 'heroku drains:add syslog+tls://syslog.highlight.io:34302 -a myapp',
				},
			],
			content:
				'See the Heroku [Log Drain docs](https://devcenter.heroku.com/articles/log-drains#syslog-drains) for more information.',
		},
		{
			title: 'Retrieve the Heroku Log Drain Token.',
			code: [
				{
					language: 'bash',
					text: 'heroku drains --json',
				},
			],
			content: 'Grab the token that heroku generated for your log drain.',
		},
		{
			title: 'Add the heroku token to highlight.',
			content:
				'Visit the [highlight Heroku integration page](https://app.highlight.io/integrations/heroku) to set your log drain token for the project.',
		},
		verifyLogs,
	],
}
