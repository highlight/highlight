import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customError,
	initializeSdk,
	installSdk,
	verifyErrors,
} from './shared-snippets-monitoring'

export const PHPOtherReorganizedContent: QuickStartContent = {
	title: 'PHP',
	subtitle: 'Learn how to set up highlight.io on your PHP backend.',
	logoKey: 'php',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
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
		{
			title: 'Record a trace.',
			content: 'Use the Highlight SDK to create spans and events.',
			code: [
				{
					text: `use Highlight\\SDK\\Highlight;
		
		$tracer = Highlight::HighlightLogger(Highlight::$highlight)
		$tracer->process(Highlight::HighlightErrorRecord()->build());
		`,
					language: 'php',
				},
			],
		},
		verifyTraces,
	],
}
