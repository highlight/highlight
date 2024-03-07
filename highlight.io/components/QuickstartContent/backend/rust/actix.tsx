import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { setUpLogging } from './shared-snippets'

export const RustActixContent: QuickStartContent = {
	title: 'actix-web',
	subtitle: 'Learn how to set up highlight.io without a framework.',
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
				"Now that you've set everything up, you can verify that the backend error handling works by throwing an error in a service. Visit the [highlight errors page](http://app.highlight.io/errors) and check that backend errors are coming in.",
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
		setUpLogging('actix'),
	],
}
