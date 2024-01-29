import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const RustTracesContent: QuickStartContent = {
	title: 'Tracing in Rust via the tracing crate',
	subtitle: `Learn how to set up highlight.io tracing with the tracing crate.`,
	entries: [
		{
			title: 'Set up your highlight.io SDK.',
			content: `First, make sure you've followed the [backend getting started](${siteUrl(
				'/docs/getting-started/backend/rust',
			)}) guide.`,
		},
		{
			title: 'Add the tracing crate to your project.',
			content:
				'The tracing crate allows you and your dependencies to record traces that will be automatically captured by the highlight.io SDK.',
			code: [
				{
					text: `[dependencies]
tracing = "0.1"`,
					language: '',
				},
			],
		},
		{
			title: 'Record a trace.',
			content:
				'Use the tracing crate to create spans and events. You can read more about this [on the docs.rs page of the tracing crate](https://docs.rs/tracing/latest/tracing/).',
			code: [
				{
					text: `use tracing::{event, span, Level};

// ...

let span = span!(Level::INFO, "my_span");
let _guard = span.enter();

event!(Level::DEBUG, "something happened inside my_span");`,
					language: 'rust',
				},
			],
		},
		verifyTraces,
	],
}
