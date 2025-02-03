import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customError,
	initializeSdk,
	installSdk,
	sessionUsage,
	verifyErrors,
} from './shared-snippets-monitoring'

export const JavaOtherReorganizedContent: QuickStartContent = {
	title: 'Java',
	subtitle:
		'Learn how to set up highlight.io on your Java backend with Java log ingestion.',
	logoKey: 'java',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		installSdk,
		initializeSdk,
		{
			title: 'Add Highlight logger.',
			content:
				'Errors will automatically record raised exceptions and send them to Highlight.',
			code: [
				{
					text: `Coming soon`,
					language: 'java',
				},
			],
		},
		verifyErrors,
		customError,
		sessionUsage,
		{
			title: 'Set up and call the Highlight Logger.',
			content:
				'Highlight.captureLog() will record and send logs to Highlight.',
			code: [
				{
					text: `Highlight.captureLog(Severity.INFO, "Just another message");`,
					language: 'java',
				},
			],
		},
		{
			title: 'Set up and call the Highlight custom records.',
			content:
				'Highlight.captureRecord() will send custom defined logs to Highlight.',
			code: [
				{
					text: `Highlight.captureRecord(HighlightRecord.log()
      .severity(Severity.warn("Internal", Priority.HIGH))
      .message("Just another message")
      .requestId("REQUEST_ID")
      .attributes(attributes -> attributes.put("application.user.name", "NgLoader"))
      .build());`,
					language: 'java',
				},
			],
		},
		verifyLogs,
		verifyTraces,
	],
}
