use actix_web::{get, App, Error, HttpServer, Responder};
use highlightio_actix::{
    highlight::{Highlight, HighlightConfig},
    HighlightActix,
};
use log::info;

#[get("/")]
async fn index() -> impl Responder {
    info!("Hello, world! Greet endpoint called.");

    format!("Hello, world! Go to /error to throw an error.")
}

#[get("/error")]
async fn error() -> Result<impl Responder, std::io::Error> {
    Err(std::io::Error::new(std::io::ErrorKind::Other, "Test error"))?;

    Ok(format!("You shouldn't be able to see this."))
}

#[actix_web::main]
async fn main() -> Result<(), Error> {
    let _ = dotenvy::dotenv();

    let project_id = std::env::var("PROJECT_ID").expect("PROJECT_ID env var not specified.");

    let h = Highlight::init(HighlightConfig {
        project_id,
        ..Default::default()
    })
    .expect("Failed to initialize Highlight.io");

    let _h = h.clone();
    HttpServer::new(move || {
        App::new()
            .wrap(HighlightActix::new(&_h))
            .service(index)
            .service(error)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    h.shutdown();

    Ok(())
}
