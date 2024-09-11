import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const SyslogContent: QuickStartContent = {
	title: 'Shipping Syslog Structured Logs',
	subtitle:
		'Configure Syslog to ship logs to highlight, formatted in RFC5424.',
	entries: [
		{
			title: 'Send syslog logs.',
			content: 'Send syslog logs over TLS to syslog.highlight.io:34302.',
			code: [
				{
					text: `echo "<0>1 2021-03-31T16:00:00-08:00 test-service cron-12345 74440 cron-12345 - hello this is a test" | ncat --ssl syslog.highlight.io 34302`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
