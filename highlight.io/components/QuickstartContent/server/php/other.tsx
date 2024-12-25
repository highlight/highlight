import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets-logging'
import {
	customError,
	initializeSdk,
	installSdk,
	verifyErrors,
} from './shared-snippets-monitoring'

export const PHPOtherReorganizedContent: QuickStartContent = {
	title: 'PHP',
	subtitle: 'Learn how to set up highlight.io on your PHP backend.',
	logoUrl: siteUrl('/images/quickstart/php.svg'),
	entries: [
		previousInstallSnippet('php'),
		installSdk,
		initializeSdk,
		verifyErrors,
		customError,
		{
			title: 'Add Highlight logger.',
			content:
				'Highlight.captureLog() will record and send logs to Highlight.',
			code: [
				{
					text: `use Highlight\\SDK\\Highlight;
		
		$logger = Highlight::HighlightLogger(Highlight::$highlight)
		$logger->process(Highlight::HighlightLogRecordBuilder()->build());
		`,
					language: 'php',
				},
			],
		},
		verifyLogs,
	],
}
