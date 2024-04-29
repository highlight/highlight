import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const PHPTracesContent: QuickStartContent = {
	title: 'Tracing in PHP via the tracing crate',
	subtitle: `Learn how to set up highlight.io tracing with the tracing crate.`,
	entries: [
		{
			title: 'Set up your highlight.io SDK.',
			content: `First, make sure you've followed the [backend getting started](${siteUrl(
				'/docs/getting-started/backend/php',
			)}) guide.`,
		},
		{
			title: 'Record a trace.',
			content:
				'Use the tracing crate to create spans and events. You can read more about this [on the docs.rs page of the tracing crate](https://docs.rs/tracing/latest/tracing/).',
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
