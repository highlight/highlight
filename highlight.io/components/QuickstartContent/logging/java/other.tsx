import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JavaOtherLogContent: QuickStartContent = {
	title: 'Java',
	subtitle: 'Learn how to set up highlight.io Java log ingestion.',
	entries: [
		previousInstallSnippet('java'),
		{
			title: 'Install the Highlight Java SDK.',
			content: 'Add Highlight to your maven pom file.',
			code: [
				{
					text: `<dependency>
	<groupId>io.highlight</groupId>
	<artifactId>highlight-sdk</artifactId>
	<version>latest</version>
</dependency>`,
					language: 'text',
				},
			],
		},
		{
			title: 'Initialize the Highlight Java SDK.',
			content:
				'`Highlight.init()` initializes the Highlight backend SDK.',
			code: [
				{
					text: `HighlightOptions options = HighlightOptions.builder("<YOUR_PROJECT_ID>")
			.version("1.0.0")
			.environment("development")
			.build();
			
			Highlight.init(options);`,
					language: 'java',
				},
			],
		},
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
	],
}
