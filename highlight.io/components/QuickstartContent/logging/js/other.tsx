import { siteUrl } from '../../../../utils/urls'
import {
	initializeNodeSDK,
	jsGetSnippet,
} from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSOtherLogContent: QuickStartContent = {
	title: 'JS',
	subtitle:
		'Learn how to set up highlight.io JS log ingestion without a logging library.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		previousInstallSnippet('js'),
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `module.exports = function() {
    console.log('hey there!');
    console.warn('whoa there', {'key': 'value'});
}`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
