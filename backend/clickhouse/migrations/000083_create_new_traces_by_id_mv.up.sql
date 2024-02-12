CREATE TABLE IF NOT EXISTS traces_by_id_new (
    `Timestamp` DateTime64(9),
    `UUID` UUID,
    `TraceId` String,
    `SpanId` String,
    `ParentSpanId` String,
    `ProjectId` UInt32,
    `SecureSessionId` String,
    `TraceState` String,
    `SpanName` LowCardinality(String),
    `SpanKind` LowCardinality(String),
    `Duration` Int64,
    `ServiceName` LowCardinality(String),
    `ServiceVersion` String,
    `TraceAttributes` Map(LowCardinality(String), String),
    `StatusCode` LowCardinality(String),
    `StatusMessage` String,
    `Environment` String,
    `HasErrors` Bool,
    `Events.Timestamp` Array(DateTime64(9)),
    `Events.Name` Array(LowCardinality(String)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)),
    `Links.TraceId` Array(String),
    `Links.SpanId` Array(String),
    `Links.TraceState` Array(String),
    `Links.Attributes` Array(Map(LowCardinality(String), String))
)
    ENGINE = MergeTree
        PARTITION BY farmHash64(TraceId) % 100
        ORDER BY (ProjectId, TraceId)
        TTL toDateTime(Timestamp) + toIntervalDay(30);
CREATE MATERIALIZED VIEW IF NOT EXISTS traces_by_id_new_mv TO traces_by_id_new (
    `Timestamp` DateTime64(9),
    `UUID` UUID,
    `TraceId` String,
    `SpanId` String,
    `ParentSpanId` String,
    `ProjectId` UInt32,
    `SecureSessionId` String,
    `TraceState` String,
    `SpanName` LowCardinality(String),
    `SpanKind` LowCardinality(String),
    `Duration` Int64,
    `ServiceName` LowCardinality(String),
    `ServiceVersion` String,
    `TraceAttributes` Map(LowCardinality(String), String),
    `StatusCode` LowCardinality(String),
    `StatusMessage` String,
    `Environment` String,
    `HasErrors` Bool,
    `Events.Timestamp` Array(DateTime64(9)),
    `Events.Name` Array(LowCardinality(String)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)),
    `Links.TraceId` Array(String),
    `Links.SpanId` Array(String),
    `Links.TraceState` Array(String),
    `Links.Attributes` Array(Map(LowCardinality(String), String))
) AS
SELECT *
FROM traces;