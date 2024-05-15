import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const installSdk: QuickStartStep = {
	title: 'Install the Highlight PHP SDK via Composer.',
	content: 'Add Highlight to your maven pom file.',
	code: [
		{
			text: `composer require highlight/php-sdk`,
			language: 'bash',
		},
	],
}

export const initializeSdk: QuickStartStep = {
	title: 'Initialize the Highlight PHP SDK.',
	content: '`Highlight.init()` initializes the Highlight backend SDK.',
	code: [
		{
			text: `use Highlight\\SDK\\Common\\HighlightOptions;
use Highlight\\SDK\\Highlight;


$projectId = 'YOUR_PROJECT_ID';

// Use only a projectId to bootstrap Highlight
if (!Highlight::isInitialized()) {
	Highlight::init($projectId);
}

// Use a HighlightOptions instance to bootstrap Highlight
$options = HighlightOptions::builder($projectId)->build();
if (!Highlight::isInitialized()) {
	Highlight::initWithOptions($options);
}

// Use a HighlightOptions instance prepped with a serviceName to bootstrap Highlight
$options = HighlightOptions::builder($projectId)->serviceName('test-service-01')->build();

if (!Highlight::isInitialized()) {
	Highlight::initWithOptions($options);
}`,
			language: 'php',
		},
	],
}

export const customError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `Highlight.captureException()` method.',
	code: [
		{
			text: `use Highlight\\SDK\\Highlight;

Highlight->captureException(new Exception('This is a test exception'));
`,
			language: 'php',
		},
	],
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from traced code.",
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		`/docs/getting-started/backend-logging/php`,
	)}) to get started.`,
})
