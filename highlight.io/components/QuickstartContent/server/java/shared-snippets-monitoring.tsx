import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const installSdk: QuickStartStep = {
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
}

export const initializeSdk: QuickStartStep = {
	title: 'Initialize the Highlight Java SDK.',
	content: '`Highlight.init()` initializes the Highlight backend SDK.',
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
}

export const customError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `Highlight.captureException()` method.',
	code: [
		{
			text: `try {
} catch (Exception ex) {
	Highlight.captureException(exception);
}`,
			language: 'java',
		},
	],
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from traced code.",
}

export const sessionUsage: QuickStartStep = {
	title: 'Using sessions',
	content:
		'When everything is finished and working, you can try to use sessions. You can find more information about the `SESSION_ID` here [parseHeaders](https://www.highlight.io/docs/sdk/nodejs#HparseHeaders)',
	code: [
		{
			text: `HighlightSession session = new HighlightSession("SESSION_ID");
	session.captureException(new NullPointerException("This shouldn't happen"));
	session.captureLog(Severity.INFO, "Just another message");
	session.captureRecord(HighlightRecord.log()
		.severity(Severity.warn("Internal", Priority.HIGH))
		.message("Just another message")
		.requestId("REQUEST_ID")
		.attributes(attributes -> attributes.put("application.user.name", "NgLoader"))
		.build());`,
			language: 'java',
		},
	],
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		`/docs/getting-started/backend-logging/java/overview`,
	)}) to get started.`,
})
