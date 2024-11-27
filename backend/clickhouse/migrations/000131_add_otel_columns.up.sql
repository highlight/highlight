ALTER TABLE traces
ADD COLUMN IF NOT EXISTS HttpResponseBody String DEFAULT TraceAttributes ['http.response.body'],
    ADD COLUMN IF NOT EXISTS HttpRequestBody String DEFAULT TraceAttributes ['http.request.body'],
    ADD COLUMN IF NOT EXISTS HttpUrl String DEFAULT TraceAttributes ['http.url'],
    ADD COLUMN IF NOT EXISTS HighlightKey String DEFAULT TraceAttributes ['highlight.key'],
    MODIFY COLUMN IF EXISTS HighlightType DEFAULT TraceAttributes ['highlight.type'],
    ADD COLUMN IF NOT EXISTS HttpAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'http.')
        and k not in (
            'http.response.body',
            'http.request.body',
            'http.url'
        ) TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS ProcessAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'process.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS OsAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'os.'), TraceAttributes),
    ADD COLUMN IF NOT EXISTS TelemetryAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'telemetry.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS WsAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'ws.'), TraceAttributes),
    ADD COLUMN IF NOT EXISTS EventAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'event.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS DbAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'db.'), TraceAttributes);
ALTER TABLE traces_sampling_new
ADD COLUMN IF NOT EXISTS HttpResponseBody String,
    ADD COLUMN IF NOT EXISTS HttpRequestBody String,
    ADD COLUMN IF NOT EXISTS HttpUrl String,
    ADD COLUMN IF NOT EXISTS HighlightKey String,
    MODIFY COLUMN IF EXISTS HighlightType REMOVE MATERIALIZED,
    ADD COLUMN IF NOT EXISTS HttpAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS ProcessAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS OsAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS TelemetryAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS WsAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS EventAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS DbAttributes Map(LowCardinality(String), String);
ALTER TABLE traces_sampling_new_mv TO traces_sampling_new (
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
        `Events.Timestamp` Array(DateTime64(9)),
        `Events.Name` Array(LowCardinality(String)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)),
        `Links.TraceId` Array(String),
        `Links.SpanId` Array(String),
        `Links.TraceState` Array(String),
        `Links.Attributes` Array(Map(LowCardinality(String), String)),
        `HttpResponseBody` String,
        `HttpRequestBody` String,
        `HttpUrl` String,
        `HighlightKey` String,
        `HighlightType` String,
        `HttpAttributes` Map(LowCardinality(String), String),
        `ProcessAttributes` Map(LowCardinality(String), String),
        `OsAttributes` Map(LowCardinality(String), String),
        `TelemetryAttributes` Map(LowCardinality(String), String),
        `WsAttributes` Map(LowCardinality(String), String),
        `EventAttributes` Map(LowCardinality(String), String),
        `DbAttributes` Map(LowCardinality(String), String)
    ) AS
SELECT *
FROM traces;