CREATE MATERIALIZED VIEW IF NOT EXISTS traces_sampling_mv TO traces_sampling (
    Timestamp DateTime64(9),
    UUID UUID,
    TraceId String,
    SpanId String,
    ParentSpanId String,
    ProjectId UInt32,
    SecureSessionId String,
    TraceState String,
    SpanName LowCardinality(String),
    SpanKind LowCardinality(String),
    Duration Int64,
    ServiceName LowCardinality(String),
    ServiceVersion String,
    TraceAttributes Map(LowCardinality(String), String),
    StatusCode LowCardinality(String),
    StatusMessage String,
    Events Nested (
        Timestamp DateTime64(9),
        Name LowCardinality(String),
        Attributes Map(LowCardinality(String), String)
    ),
    Links Nested (
        TraceId String,
        SpanId String,
        TraceState String,
        Attributes Map(LowCardinality(String), String)
    )
) AS
SELECT *
FROM traces;