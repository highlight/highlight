import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const RustOtherLogContent: QuickStartContent = {
	title: 'Logging from Rust',
	subtitle: 'Learn how to set up highlight.io Rust log ingestion.',
	logoUrl: siteUrl('/images/quickstart/rust.svg'),
	entries: [
		{
			title: 'Set up your highlight.io SDK.',
			content: `First, make sure you've followed the [backend getting started](${siteUrl(
				'/docs/getting-started/backend-sdk/rust/other',
			)}) guide.`,
		},
		{
			title: 'Install the log crate.',
			content:
				'Highlight works with the log crate to make logging easier.',
			code: [
				{
					text: `[dependencies]
log = "0.4"`,
					language: 'rust',
				},
			],
		},
		{
			title: 'Call the logging facades.',
			content:
				"Highlight::init automatically installs a logging backend, so you can call any of the log crate's macros to emit logs. NOTE: env_logger only logs errors on the console out by default, so to see your logs, run your project with the `RUST_LOG=<crate name>` environment variable, or `RUST_LOG=trace` to see everything.",
			code: [
				{
					text: `use log::{trace, debug, info, warn, error};

// ...

trace!("This is a trace! log. {:?}", "hi!");
debug!("This is a debug! log. {}", 3 * 3);
info!("This is an info! log. {}", 2 + 2);
warn!("This is a warn! log.");
error!("This is an error! log.");`,
					language: 'rust',
				},
			],
		},
		verifyLogs,
	],
}
