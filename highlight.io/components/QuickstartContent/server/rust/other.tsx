import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'

export const RustOtherReorganizedContent: QuickStartContent = {
	title: 'Rust',
	subtitle: 'Learn how to set up highlight.io without a framework.',
	logoKey: 'rust',
	entries: [
		frontendInstallSnippet,
		{
			title: 'Install the Highlight Rust SDK.',
			content:
				"Add Highlight to your Config.toml. You'll need to pick your features based on what kind of runtime your project uses. If everything is synchronous, you can use the default features. If you're using `tokio`, turn off default features and use the feature `tokio`. If you're using `async-std`, turn off default features and use the feature `async-std`.",
			code: [
				{
					text: `[dependencies.highlightio]
version = "1"
default-features = ...
features = [...]`,
					language: '',
				},
			],
		},
		{
			title: 'Initialize the Highlight Rust SDK.',
			content: '`highlightio::Highlight::init` initializes the SDK.',
			code: [
				{
					text: `use highlightio::{Highlight, HighlightConfig};

// or async fn main()
// with #[tokio::main] if you're using tokio, etc.
fn main() {
    let h = Highlight::init(HighlightConfig {
        project_id: "<YOUR_PROJECT_ID>".to_string(),
        service_name: "my-rust-app".to_string(),
        service_version: "git-sha".to_string(),
        ..Default::default()
    }).expect("Failed to initialize Highlight.io");

    // ...

	h.shutdown();
}`,
					language: 'rust',
				},
			],
		},
		{
			title: 'Capture errors.',
			content:
				'`Highlight::capture_error` can be used to explicitly capture any error.',
			code: [
				{
					text: `fn do_something() -> Result<(), Error> {
    // ...
}

fn main() {
    // ...

    match do_something() {
        Ok(_) => {},
        Err(e) => h.capture_error(&e),
    };
}`,
					language: 'rust',
				},
			],
		},
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set up the SDK, you can verify that the backend error handling works by sending an error in. Visit the [highlight errors page](https://app.highlight.io/errors) and check that backend errors are coming in.",
			code: [
				{
					text: `fn main() {
    // ...

    let e = std::io::Error::new(
		std::io::ErrorKind::Other,
		"This is a test error."
	);
    h.capture_error(&e);
}`,
					language: 'rust',
				},
			],
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
