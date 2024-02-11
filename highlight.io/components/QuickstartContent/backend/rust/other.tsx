import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { setUpLogging } from './shared-snippets'

export const RustOtherContent: QuickStartContent = {
	title: 'Rust',
	subtitle: 'Learn how to set up highlight.io without a framework.',
	logoUrl: siteUrl('/images/quickstart/rust.svg'),
	entries: [
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
				"Now that you've set up the SDK, you can verify that the backend error handling works by sending an error in. Visit the [highlight errors page](http://app.highlight.io/errors) and check that backend errors are coming in.",
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
		setUpLogging('other'),
	],
}
