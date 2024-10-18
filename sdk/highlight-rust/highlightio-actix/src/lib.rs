/// Official [Highlight.io](https://highlight.io) SDK for Actix. Refer to our docs on how to get started with
/// [error monitoring](https://www.highlight.io/docs/getting-started/backend-sdk/rust/actix),
/// [logging](https://www.highlight.io/docs/getting-started/backend-logging/rust/actix), and
/// [tracing](https://www.highlight.io/docs/getting-started/backend-tracing/rust/actix).

use std::{borrow::Cow, pin::Pin};

use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    http::{
        header::{self, HeaderMap, CONTENT_LENGTH},
        Version,
    },
    Error,
};
use futures_util::{
    future::{ok, Ready},
    Future, FutureExt as _,
};
use highlightio::Highlight;
use opentelemetry::{
    global,
    propagation::Extractor,
    trace::{FutureExt as _, SpanKind, Status, TraceContextExt, Tracer as _, TracerProvider as _},
    KeyValue,
};
use opentelemetry_semantic_conventions::trace::{
    CLIENT_ADDRESS, CLIENT_SOCKET_ADDRESS, HTTP_REQUEST_BODY_SIZE, HTTP_REQUEST_METHOD,
    HTTP_RESPONSE_STATUS_CODE, HTTP_ROUTE, NETWORK_PROTOCOL_VERSION, SERVER_ADDRESS, SERVER_PORT,
    URL_PATH, URL_QUERY, URL_SCHEME, USER_AGENT_ORIGINAL,
};

pub mod highlight {
    pub use highlightio::*;
}

struct RequestHeaderCarrier<'a> {
    headers: &'a HeaderMap,
}

impl<'a> RequestHeaderCarrier<'a> {
    fn new(headers: &'a HeaderMap) -> Self {
        RequestHeaderCarrier { headers }
    }
}

impl<'a> Extractor for RequestHeaderCarrier<'a> {
    fn get(&self, key: &str) -> Option<&str> {
        self.headers.get(key).and_then(|v| v.to_str().ok())
    }

    fn keys(&self) -> Vec<&str> {
        self.headers.keys().map(|header| header.as_str()).collect()
    }
}

#[derive(Clone)]
pub struct HighlightActix {
    highlight: Highlight,
}

impl HighlightActix {
    pub fn new(h: &Highlight) -> Self {
        HighlightActix {
            highlight: h.clone(),
        }
    }
}

pub struct HighlightMiddleware<S> {
    tracer: global::BoxedTracer,
    service: S,
    inner: HighlightActix,
}

impl<S, B> Transform<S, ServiceRequest> for HighlightActix
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = HighlightMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(HighlightMiddleware {
            tracer: global::tracer_provider().versioned_tracer(
                "highlight-actix",
                Some(env!("CARGO_PKG_VERSION")),
                Some(opentelemetry_semantic_conventions::SCHEMA_URL),
                None,
            ),
            service,
            inner: self.clone(),
        })
    }
}

fn req_to_attrs(req: &ServiceRequest, http_route: &str, h: &Highlight) -> Vec<KeyValue> {
    let mut attributes: Vec<KeyValue> = Vec::with_capacity(16);

    let conn_info = req.connection_info();
    let remote_addr = conn_info.realip_remote_addr();

    attributes.push(KeyValue::new(HTTP_ROUTE, http_route.to_owned()));

    if let Some(remote_addr) = remote_addr {
        attributes.push(KeyValue::new(CLIENT_ADDRESS, remote_addr.to_string()));
    }

    if let Some(peer_addr) = req.peer_addr().map(|socket| socket.ip().to_string()) {
        if Some(peer_addr.as_str()) != remote_addr {
            // Client is going through a proxy
            attributes.push(KeyValue::new(CLIENT_SOCKET_ADDRESS, peer_addr));
        }
    }
    let mut host_parts = conn_info.host().split_terminator(':');
    if let Some(host) = host_parts.next() {
        attributes.push(KeyValue::new(SERVER_ADDRESS, host.to_string()));
    }
    if let Some(port) = host_parts.next().and_then(|port| port.parse::<i64>().ok()) {
        if port != 80 && port != 443 {
            attributes.push(KeyValue::new(SERVER_PORT, port));
        }
    }
    if let Some(path_query) = req.uri().path_and_query() {
        if path_query.path() != "/" {
            attributes.push(KeyValue::new(URL_PATH, path_query.path().to_string()));
        }
        if let Some(query) = path_query.query() {
            attributes.push(KeyValue::new(URL_QUERY, query.to_string()));
        }
    }
    attributes.push(KeyValue::new(URL_SCHEME, conn_info.scheme().to_owned()));

    attributes.push(KeyValue::new(
        HTTP_REQUEST_METHOD,
        req.method().as_str().to_owned(),
    ));
    attributes.push(KeyValue::new::<_, String>(
        NETWORK_PROTOCOL_VERSION,
        match req.version() {
            Version::HTTP_09 => "0.9".into(),
            Version::HTTP_10 => "1.0".into(),
            Version::HTTP_11 => "1.1".into(),
            Version::HTTP_2 => "2".into(),
            Version::HTTP_3 => "3".into(),
            other => format!("{:?}", other).into(),
        },
    ));

    if let Some(size) = req
        .headers()
        .get(CONTENT_LENGTH)
        .and_then(|len| len.to_str().ok().and_then(|s| s.parse::<i64>().ok()))
        .filter(|&len| len > 0)
    {
        attributes.push(KeyValue::new(HTTP_REQUEST_BODY_SIZE, size));
    }

    if let Some(ua) = req
        .headers()
        .get(header::USER_AGENT)
        .and_then(|s| s.to_str().ok())
    {
        attributes.push(KeyValue::new(USER_AGENT_ORIGINAL, ua.to_string()));
    }

    attributes.push(KeyValue::new("highlight.project_id", h.project_id()));

    if let Some(hr) = req.headers().get("x-highlight-request") {
        if let Some((session_id, trace_id)) = hr.to_str().ok().and_then(|x| x.split_once("/")) {
            attributes.push(KeyValue::new("highlight.session_id", session_id.to_owned()));
            attributes.push(KeyValue::new("highlight.trace_id", trace_id.to_owned()));
        }
    }

    attributes
}

impl<S, B> Service<ServiceRequest> for HighlightMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(
        &self,
        ctx: &mut core::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        let res = self.service.poll_ready(ctx);
        res
    }

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
        let parent_context = global::get_text_map_propagator(|propagator| {
            propagator.extract(&RequestHeaderCarrier::new(req.headers_mut()))
        });

        let http_route: Cow<'static, str> = req
            .match_pattern()
            .map(Into::into)
            .unwrap_or_else(|| "default".into());

        let mut builder = self.tracer.span_builder(http_route.clone());
        builder.span_kind = Some(SpanKind::Server);
        builder.attributes = Some(req_to_attrs(&req, &http_route, &self.inner.highlight));

        let span = self.tracer.build_with_context(builder, &parent_context);
        let cx = parent_context.with_span(span);

        let fut = self
            .service
            .call(req)
            .with_context(cx.clone())
            .map(move |res| match res {
                Ok(ok_res) => {
                    let span = cx.span();
                    span.set_attribute(
                        HTTP_RESPONSE_STATUS_CODE.i64(ok_res.status().as_u16() as i64),
                    );
                    if ok_res.status().is_server_error() {
                        if let Some(e) = ok_res.response().error() {
                            span.record_error(&e);
                        }


                        span.set_status(Status::error(
                            ok_res
                                .status()
                                .canonical_reason()
                                .map(ToString::to_string)
                                .unwrap_or_default(),
                        ));
                    };
                    span.end();
                    Ok(ok_res)
                }
                Err(err) => {
                    let span = cx.span();
                    span.record_error(&err);
                    span.set_status(Status::error(format!("{:?}", err)));
                    span.end();
                    Err(err)
                }
            });

        Box::pin(fut)
    }
}
