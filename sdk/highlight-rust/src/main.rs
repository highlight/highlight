mod sdk;

use sdk::Highlight;
use sdk::HighlightOptions;
use axum::{
    routing::get,
    Router
};
use tower::{ServiceBuilder, ServiceExt, Service};
use tower_http::cors::{Any, CorsLayer};

use http::{Request, Response, Method, header};
use tracing::{span, error};
use hyper::Body;
use std::convert::Infallible;
async fn handle(request: Request<Body>) -> Result<Response<Body>, Infallible> {
    Ok(Response::new(Body::empty()))
}

#[tokio::main]
async fn main() {
    // let options = HighlightOptions::builder("6glrroqg")
    //         .with_backend_url("https://something.com")
    //         .with_environment("dev")
    //         .build();
    // Highlight::init(options);
    // println!("Hello, world!");
    let options = HighlightOptions::builder("6glrroqg")
        .with_backend_url("https://otel.highlight.io:4318")
        .with_environment("dev")
        .build();
    Highlight::init(options);


    let app = Router::new().route("/", get(|| async { 
        let root = span!(tracing::Level::ERROR, "app_start", work_units = 2);
        let _enter = root.enter();
        // let  = h;
        error!("This event will be logged in the root span.");
        // log::error!(target: "highlight_rust::sdk::highlight", "hi from {}. My price is {}", "apple", 2.99);
        // println!("{:?}",log::max_level());
        " Hellooo!!!! world!! "
    }))
    .layer(CorsLayer::very_permissive());
    axum::Server::bind(&"0.0.0.0:9991".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap()
}
