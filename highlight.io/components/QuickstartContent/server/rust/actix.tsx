import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'

export const RustActixReorganizedContent: QuickStartContent = {
	title: 'actix-web',
	subtitle: 'Learn how to set up highlight.io with the actix-web framework.',
	logoUrl: siteUrl('/images/quickstart/rust.svg'),
	entries: [
		frontendInstallSnippet,
		{
			title: 'Install the Highlight Rust actix SDK.',
			content: 'Add Highlight to your Config.toml.',
			code: [
				{
					text: `[dependencies]
highlightio-actix = "1"`,
					language: '',
				},
			],
		},
		{
			title: 'Initialize the Highlight Rust SDK and actix Middleware.',
			content:
				'`highlightio_actix::highlight::Highlight::init` initializes the SDK, and adding the `highlightio_actix::HighlightActix` middleware will start tracing actix.',
			code: [
				{
					text: `use actix_web::{App, Error, HttpServer};
use highlightio_actix::{highlight::{Highlight, HighlightConfig}, HighlightActix};

// ...your services...

#[actix_web::main]
async fn main() -> Result<(), Error> {
    let h = Highlight::init(HighlightConfig {
        project_id: "<YOUR_PROJECT_ID>".to_string(),
        service_name: "my-rust-app".to_string(),
        service_version: "git-sha".to_string(),
        ..Default::default()
    }).expect("Failed to initialize Highlight.io");

	let _h = h.clone();
    HttpServer::new(move || {
        App::new()
            .wrap(HighlightActix::new(&_h))
            // ...
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

	h.shutdown();

    Ok(())
}`,
					language: 'rust',
				},
			],
		},
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set everything up, you can verify that the backend error handling works by throwing an error in a service. Visit the [highlight errors page](https://app.highlight.io/errors) and check that backend errors are coming in.",
			code: [
				{
					text: `// ...
#[get("/error")]
async fn error() -> Result<impl Responder, std::io::Error> {
    Err(std::io::Error::new(
        std::io::ErrorKind::Other,
        "Test error"
    ))?;

    Ok(format!("You shouldn't be able to see this."))
}

// ...

#[actix_web::main]
async fn main() -> Result<(), Error> {
    // ...

    HttpServer::new(move || {
        App::new()
            .wrap(HighlightActix::new(&h))
            .service(error) // add this
    })
    
    // ...
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
