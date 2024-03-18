import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const RustActixLogContent: QuickStartContent = {
	title: 'Logging from Rust with actix-web',
	subtitle: 'Learn how to set up highlight.io actix-web log ingestion.',
	logoUrl: siteUrl('/images/quickstart/rust.svg'),
	entries: [
		{
			title: 'Set up your highlight.io SDK.',
			content: `First, make sure you've followed the [backend getting started](${siteUrl(
				'/docs/getting-started/backend/rust/actix',
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
				"Highlight::init automatically installs a logging backend, so you can call any of the log crate's macros to emit logs. NOTE: env_logger only logs errors to the console out by default, so to see your logs, run your project with the `RUST_LOG=<crate name>` environment variable, or `RUST_LOG=trace` to see everything.",
			code: [
				{
					text: `use log::{trace, debug, info, warn, error};

// ...

#[get("/")]
async fn index() -> impl Responder {
    info!("Hello, world! Greet endpoint called.");

    format!("Hello, world!")
}`,
					language: 'rust',
				},
			],
		},
		verifyLogs,
	],
}
